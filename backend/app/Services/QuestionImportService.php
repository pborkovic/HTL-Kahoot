<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Question;
use App\Models\User;
use App\Repositories\Contracts\QuestionRepositoryContract;
use App\Services\Contracts\QuestionImportServiceContract;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use JsonException;
use Throwable;

class QuestionImportService implements QuestionImportServiceContract
{
    public function __construct(
        private readonly QuestionRepositoryContract $questionRepository,
    ) {}

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function import(string $content, string $format, User $user): array
    {
        $parsed = match ($format) {
            'json' => $this->parseJson(content: $content),
            'gift' => $this->parseGift(content: $content),
            default => throw new InvalidArgumentException(message: "Unsupported format: {$format}"),
        };

        return $this->persistQuestions(
            questions: $parsed,
            user: $user
        );
    }


    /**
     * Parse a JSON string into a normalised question array.
     *
     * Accepts either a JSON array of questions or a JSON object with a
     * `questions` key. Items missing `type` or `title` are skipped with
     * a warning log entry.
     *
     * @param string $content Raw JSON string.
     *
     * @return array<int, array{type: string, title: string, answer_options: array<int, array{text: string, is_correct: bool, sort_order: int}>}>
     *
     * @throws InvalidArgumentException|JsonException If the JSON is malformed or has an unexpected structure.
     *
     * @author Philipp Borkovic
     */
    private function parseJson(string $content): array
    {
        $data = json_decode(
            json: $content,
            associative: true,
            flags: JSON_THROW_ON_ERROR
        );

        if (isset($data['questions']) && is_array($data['questions'])) {
            $data = $data['questions'];
        }
        if (!is_array($data) || !array_is_list($data)) {
            throw new InvalidArgumentException('JSON must be an array of questions or an object with a "questions" key.');
        }

        $questions = [];
        foreach ($data as $i => $item) {
            if (!isset($item['type'], $item['title'])) {
                Log::warning(message: "Question import: JSON item {$i} missing type or title, skipping.");

                continue;
            }

            $questions[] = [
                'type'              => $item['type'],
                'title'             => $item['title'],
                'explanation'       => $item['explanation'] ?? null,
                'difficulty'        => $item['difficulty'] ?? null,
                'default_points'    => $item['default_points'] ?? 1000,
                'default_time_limit' => $item['default_time_limit'] ?? null,
                'randomize_options' => $item['randomize_options'] ?? true,
                'config'            => $item['config'] ?? [],
                'answer_options'    => array_values(array_map(
                    static fn(int $idx, array $opt): array => [
                        'text'       => $opt['text'] ?? '',
                        'is_correct' => $opt['is_correct'] ?? false,
                        'sort_order' => $opt['sort_order'] ?? $idx,
                    ],
                    array_keys($item['answer_options'] ?? []),
                    $item['answer_options'] ?? [],
                )),
            ];
        }

        return $questions;
    }


    /**
     * Parse Moodle GIFT format text into a normalised question array.
     *
     * Splits the text into blocks separated by blank lines, parses each
     * block individually, and returns all successfully parsed questions.
     * Supports: Single/Multiple Choice, True/False, Short Answer, Matching, Numerical.
     *
     * @param string $content Raw GIFT format content.
     *
     * @return array<int, array{type: string, title: string, answer_options: array}>
     *
     * @see https://docs.moodle.org/en/GIFT_format
     *
     * @author Philipp Borkovic
     */
    private function parseGift(string $content): array
    {
        $lines  = preg_split(
            pattern: '/\r\n|\r|\n/',
            subject: $content
        );
        $blocks = $this->splitIntoBlocks(lines: $lines);

        $questions = [];
        foreach ($blocks as $block) {
            $parsed = $this->parseGiftBlock(block: $block);

            if ($parsed !== null) {
                $questions[] = $parsed;
            }
        }

        return $questions;
    }

    /**
     * Split raw lines into question blocks separated by blank lines.
     *
     * Comment lines (starting with //) are stripped. Continuation lines
     * consisting of a single backslash insert a newline into the current block.
     *
     * @param array<int, string> $lines The raw lines from the GIFT file.
     *
     * @return array<int, string> Each element is a trimmed, single-string question block.
     *
     * @author Philipp Borkovic
     */
    private function splitIntoBlocks(array $lines): array
    {
        $blocks  = [];
        $current = '';

        foreach ($lines as $line) {
            $trimmed = trim(string: $line);

            if (str_starts_with(haystack: $trimmed, needle: '//')) {
                continue;
            }

            if ($trimmed === '') {
                if (trim(string: $current) !== '') {
                    $blocks[] = trim(string: $current);
                    $current  = '';
                }

                continue;
            }

            if ($trimmed === '\\') {
                $current .= "\n";

                continue;
            }

            $current .= ($current !== '' ? ' ' : '') . $trimmed;
        }

        if (trim(string: $current) !== '') {
            $blocks[] = trim(string: $current);
        }

        return $blocks;
    }

    /**
     * Parse a single GIFT question block into structured data.
     *
     * Strips optional format prefixes ([html], [markdown], etc.), extracts the
     * optional question name (::Name::), locates the answer block within braces,
     * and delegates to parseGiftAnswerBlock for type detection and answer extraction.
     * Default version fields (explanation, difficulty, etc.) are appended.
     *
     * @param string $block The raw question block text.
     *
     * @return array{
     *     type: string,
     *     title: string,
     *     answer_options: array,
     *     explanation: null,
     *     difficulty: null,
     *     default_points: int,
     *     default_time_limit: null,
     *     randomize_options: bool,
     *     config: array
     * }|null Null if the block has no valid answer braces.
     *
     * @author Philipp Borkovic
     **/
    private function parseGiftBlock(string $block): ?array
    {
        $block = preg_replace(
            pattern: '/^\[(?:html|markdown|plain|moodle)\]\s*/i',
            replacement: '',
            subject: $block
        );

        $name = null;
        if (preg_match(pattern: '/^::(.+?)::(.*)/s', subject: $block, matches: $matches)) {
            $name  = trim(string: $this->unescape(text: $matches[1]));
            $block = trim(string: $matches[2]);
        }

        $answerStart = $this->findUnescapedChar(
            text: $block,
            char: '{'
        );
        if ($answerStart === false) {
            return null;
        }

        $answerEnd = $this->findMatchingBrace(
            text: $block,
            start: $answerStart
        );
        if ($answerEnd === false) {
            return null;
        }

        $questionText  = trim(
            string: substr(
                string: $block,
                offset: 0,
                length: $answerStart
            )
        );
        $answerContent = substr(
            string: $block,
            offset: $answerStart + 1,
            length: $answerEnd - $answerStart - 1
        );
        $afterAnswer   = trim(
            string: substr(
                string: $block,
                offset: $answerEnd + 1
            )
        );

        $title = trim(string: $questionText . ($afterAnswer !== '' ? ' _____ ' . $afterAnswer : ''));
        if ($title === '') {
            $title = $name ?? 'Imported Question';
        }

        $title         = $this->unescape(text: $title);
        $answerContent = trim(string: $answerContent);

        $result = $this->parseGiftAnswerBlock(
            answerContent: $answerContent,
            title: $title
        );

        $result['explanation']       = null;
        $result['difficulty']        = null;
        $result['default_points']    = 1000;
        $result['default_time_limit'] = null;
        $result['randomize_options'] = true;
        $result['config']            = [];

        return $result;
    }

    /**
     * Determine the question type from the answer block content and extract answers.
     *
     * Inspects the raw content between braces to classify the question as
     * True/False, Matching, Numerical, Short Answer, or Multiple Choice,
     * then delegates to the appropriate specialised parser.
     *
     * @param string $answerContent The raw text between { and }.
     * @param string $title         The already-extracted question title.
     *
     * @return array{
     *     type: string,
     *     title: string,
     *     answer_options: array<int,
     *     array{text: string,
     *     is_correct: bool,
     *     sort_order: int}>
     *     }
     *
     * @author Philipp Borkovic
     */
    private function parseGiftAnswerBlock(string $answerContent, string $title): array
    {
        if (preg_match(pattern: '/^(TRUE|FALSE|T|F)\s*(#.*)?$/i', subject: $answerContent, matches: $matches)) {
            $correct = in_array(
                needle: strtoupper(
                    string: $matches[1]),
                haystack: ['TRUE', 'T'],
                strict: true
            );
            return [
                'type'           => 'true_false',
                'title'          => $title,
                'answer_options' => [
                    ['text' => 'Wahr', 'is_correct' => $correct, 'sort_order' => 0],
                    ['text' => 'Falsch', 'is_correct' => !$correct, 'sort_order' => 1],
                ],
            ];
        }

        if (preg_match(pattern: '/=.*->/', subject: $answerContent)) {
            return $this->parseGiftMatching(
                answerContent: $answerContent,
                title: $title
            );
        }

        if (preg_match(pattern: '/^#/', subject: $answerContent)) {
            return $this->parseGiftNumerical(
                answerContent: $answerContent,
                title: $title
            );
        }

        if (str_contains(haystack: $answerContent, needle: '=') && !str_contains(haystack: $answerContent, needle: '~')) {
            return $this->parseGiftShortAnswer(
                answerContent: $answerContent,
                title: $title
            );
        }

        return $this->parseGiftMultipleChoice(
            answerContent: $answerContent,
            title: $title
        );
    }

    /**
     * Parse a GIFT multiple-choice (or single-choice) answer block.
     *
     * Extracts options marked with = (correct) or ~ (incorrect), handles
     * percentage weightings (%nn%), and classifies the result as
     * 'multiple_choice' or 'single_choice' based on the number of correct answers.
     *
     * @param string $answerContent The raw answer choices text.
     * @param string $title         The question title.
     *
     * @return array{
     *     type: string,
     *     title: string,
     *     answer_options: array<int,
     *     array{
     *          text: string,
     *          is_correct: bool,
     *          sort_order: int
     *      }>
     *     }
     *
     * @author Philipp Borkovic
     **/
    private function parseGiftMultipleChoice(string $answerContent, string $title): array
    {
        $options        = $this->extractGiftOptions(content: $answerContent);
        $hasPercentages = false;
        $answers        = [];
        $sortOrder      = 0;

        foreach ($options as $option) {
            $text       = $option['text'];
            $isCorrect  = $option['is_correct'];
            $percentage = $option['percentage'];

            if ($percentage !== null) {
                $hasPercentages = true;
                $isCorrect      = $percentage > 0;
            }

            $answers[] = [
                'text'       => $this->unescape(text: $text),
                'is_correct' => $isCorrect,
                'sort_order' => $sortOrder++,
            ];
        }

        $correctCount = count(
            value: array_filter(
                array: $answers,
                callback: fn(array $a): bool => $a['is_correct']
            )
        );

        $type = $correctCount > 1 || $hasPercentages ? 'multiple_choice' : 'single_choice';

        return [
            'type'           => $type,
            'title'          => $title,
            'answer_options' => $answers,
        ];
    }

    /**
     * Parse a GIFT short-answer (fill-in-the-blank) answer block.
     *
     * All options marked with = are treated as accepted correct answers.
     *
     * @param string $answerContent The raw answer choices text.
     * @param string $title         The question title.
     *
     * @return array{type: string, title: string, answer_options: array<int, array{text: string, is_correct: bool, sort_order: int}>}
     *
     *
     */
    private function parseGiftShortAnswer(string $answerContent, string $title): array
    {
        $options   = $this->extractGiftOptions(content: $answerContent);
        $answers   = [];
        $sortOrder = 0;

        foreach ($options as $option) {
            $answers[] = [
                'text'       => $this->unescape(text: $option['text']),
                'is_correct' => true,
                'sort_order' => $sortOrder++,
            ];
        }

        return [
            'type'           => 'short_answer',
            'title'          => $title,
            'answer_options' => $answers,
        ];
    }

    /**
     * Parse a GIFT matching answer block.
     *
     * Extracts pairs in the format =subquestion -> subanswer and stores
     * each pair as a single answer option with an arrow separator.
     *
     * @param string $answerContent The raw answer choices text.
     * @param string $title         The question title.
     *
     * @return array{type: string, title: string, answer_options: array<int, array{text: string, is_correct: bool, sort_order: int}>}
     *
     * @author Philipp Borkovic
     */
    private function parseGiftMatching(string $answerContent, string $title): array
    {
        preg_match_all(
            pattern: '/=\s*(.+?)\s*->\s*(.+?)(?=\s*=|\s*$)/s',
            subject: $answerContent,
            matches: $matches,
            flags: PREG_SET_ORDER,
        );

        $answers   = [];
        $sortOrder = 0;

        foreach ($matches as $match) {
            $subQuestion = $this->unescape(
                text: trim(
                    string: $match[1]
                )
            );
            $subAnswer   = $this->unescape(
                text: trim(
                    string: $match[2]
                )
            );

            $answers[] = [
                'text'       => $subQuestion . ' → ' . $subAnswer,
                'is_correct' => true,
                'sort_order' => $sortOrder++,
            ];
        }

        return [
            'type'           => 'matching',
            'title'          => $title,
            'answer_options' => $answers,
        ];
    }

    /**
     * Parse a GIFT numerical answer block.
     *
     * Supports three formats: range (min..max), tolerance (number:tolerance),
     * and exact number. The answer text is stored in a human-readable form.
     *
     * @param string $answerContent The raw answer text (leading # already present).
     * @param string $title         The question title.
     *
     * @return array{type: string, title: string, answer_options: array<int, array{text: string, is_correct: bool, sort_order: int}>}
     *
     * @author Philipp Borkovic
     */
    private function parseGiftNumerical(string $answerContent, string $title): array
    {
        $content = ltrim(string: $answerContent, characters: '#');
        $answers = [];

        if (preg_match(pattern: '/^([\d.]+)\.\.([\d.]+)/', subject: $content, matches: $match)) {
            $answers[] = ['text' => $match[1] . '..' . $match[2], 'is_correct' => true, 'sort_order' => 0];
        } elseif (preg_match(pattern: '/^([\d.]+):([\d.]+)/', subject: $content, matches: $match)) {
            $answers[] = ['text' => $match[1] . ' (±' . $match[2] . ')', 'is_correct' => true, 'sort_order' => 0];
        } elseif (preg_match(pattern: '/^([\d.]+)/', subject: $content, matches: $match)) {
            $answers[] = ['text' => $match[1], 'is_correct' => true, 'sort_order' => 0];
        }

        return [
            'type'           => 'numerical',
            'title'          => $title,
            'answer_options' => $answers,
        ];
    }

    /**
     * Extract individual answer options from a GIFT choice block.
     *
     * Splits on unescaped = (correct) and ~ (incorrect) markers, handles
     * optional percentage weightings (%nn%), and strips inline feedback
     * after unescaped # characters.
     *
     * @param string $content The raw answer choices text inside braces.
     *
     * @return array<int, array{text: string, is_correct: bool, percentage: int|null}>
     *
     * @author Philipp Borkovic
     */
    private function extractGiftOptions(string $content): array
    {
        $options = [];

        preg_match_all(
            pattern: '/([~=])\s*(%[-\d]+%)?\s*(.+?)(?=\s*(?:[~=](?:\s*%[-\d]+%)?)| $)/s',
            subject: $content,
            matches: $matches,
            flags: PREG_SET_ORDER,
        );

        foreach ($matches as $match) {
            $marker     = $match[1];
            $percentStr = $match[2] ?? '';
            $text       = trim(string: $match[3]);

            $feedbackPos = $this->findUnescapedChar(text: $text, char: '#');
            if ($feedbackPos !== false) {
                $text = trim(
                    string: substr(
                        string: $text,
                        offset: 0,
                        length: $feedbackPos
                    )
                );
            }

            $percentage = null;
            if ($percentStr !== '') {
                $percentage = (int) trim(
                    string: $percentStr,
                    characters: '%'
                );
            }

            if ($text !== '') {
                $options[] = [
                    'text'       => $text,
                    'is_correct' => $marker === '=',
                    'percentage' => $percentage,
                ];
            }
        }

        return $options;
    }


    /**
     * Find the position of the first unescaped occurrence of a character.
     *
     * Skips characters preceded by a backslash (GIFT escape sequences).
     *
     * @param string $text The text to search.
     * @param string $char The single character to find.
     *
     * @return int|false The zero-based position, or false if not found.
     *
     * @author Philipp Borkovic
     */
    private function findUnescapedChar(string $text, string $char): int|false
    {
        $len = strlen(string: $text);
        for ($i = 0; $i < $len; $i++) {
            if ($text[$i] === '\\') {
                $i++;

                continue;
            }
            if ($text[$i] === $char) {
                return $i;
            }
        }

        return false;
    }

    /**
     * Find the position of the matching closing brace for an opening brace.
     *
     * Tracks brace depth to correctly handle nested braces and skips
     * escaped braces (preceded by a backslash).
     *
     * @param string $text  The full text containing braces.
     * @param int    $start The position of the opening brace.
     *
     * @return int|false The position of the matching closing brace, or false if unmatched.
     *
     * @author Philipp Borkovic
     */
    private function findMatchingBrace(string $text, int $start): int|false
    {
        $depth = 0;
        $len   = strlen(string: $text);

        for ($i = $start; $i < $len; $i++) {
            if ($text[$i] === '\\') {
                $i++;

                continue;
            }
            if ($text[$i] === '{') {
                $depth++;
            } elseif ($text[$i] === '}') {
                $depth--;
                if ($depth === 0) {
                    return $i;
                }
            }
        }

        return false;
    }

    /**
     * Unescape GIFT special characters.
     *
     * Replaces escaped sequences (\~, \=, \#, \{, \}, \\) with their
     * literal character equivalents.
     *
     * @param string $text The escaped GIFT text.
     *
     * @return string The unescaped text.
     *
     * @author Philipp Borkovic
     */
    private function unescape(string $text): string
    {
        return str_replace(
            search: ['\\~', '\\=', '\\#', '\\{', '\\}', '\\\\'],
            replace: ['~', '=', '#', '{', '}', '\\'],
            subject: $text,
        );
    }

    /**
     * Persist an array of normalised questions via the question repository.
     *
     * Iterates over each parsed question, delegates creation to the repository,
     * and collects results. Failures are caught individually so that one bad
     * question does not abort the entire import.
     *
     * @param array<int, array{type: string, title: string, answer_options: array}> $questions Normalised question data.
     * @param User $user The authenticated user performing the import.
     *
     * @return array{imported: int, failed: int, errors: array<int, string>, questions: array<int, Question>}
     *
     * @author Philipp Borkovic
     */
    private function persistQuestions(array $questions, User $user): array
    {
        $imported         = 0;
        $failed           = 0;
        $errors           = [];
        $createdQuestions  = [];

        foreach ($questions as $i => $data) {
            try {
                $question = $this->questionRepository->createWithVersionAndOptions(
                    data: $data,
                    userId: $user->id,
                );

                $createdQuestions[] = $question;
                $imported++;
            } catch (Throwable $e) {
                $failed++;
                $label = $data['title'] ?? "index {$i}";
                $errors[] = "Question \"{$label}\": {$e->getMessage()}";
                Log::warning(message: "Question import failed for item {$i}", context: [
                    'error' => $e->getMessage(),
                    'data'  => $data,
                ]);
            }
        }

        return [
            'imported'  => $imported,
            'failed'    => $failed,
            'errors'    => $errors,
            'questions' => $createdQuestions,
        ];
    }
}
