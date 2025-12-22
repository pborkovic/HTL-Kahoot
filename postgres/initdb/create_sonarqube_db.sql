-- Init script for SonarQube database and user
CREATE USER sonarqube WITH ENCRYPTED PASSWORD 'sonarqube';
CREATE DATABASE sonarqube OWNER sonarqube;