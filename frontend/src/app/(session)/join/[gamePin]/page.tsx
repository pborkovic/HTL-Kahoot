import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ gamePin: string }>;
}

export default async function JoinWithPinPage({ params }: Props) {
  const { gamePin } = await params;

  redirect(`/join?pin=${gamePin}`);
}
