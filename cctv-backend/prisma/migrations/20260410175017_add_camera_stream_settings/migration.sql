-- AlterTable
ALTER TABLE `Camera` ADD COLUMN `isAudioEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `streamType` ENUM('MAIN', 'SUB') NOT NULL DEFAULT 'MAIN';
