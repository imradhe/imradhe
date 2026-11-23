CREATE TABLE scenes (
    sceneID varchar(255) NOT NULL,
    title varchar(255) NOT NULL,
    sceneNumber int NOT NULL,
    actNumber int NOT NULL,
    chapterNumber int NOT NULL,
    storyID varchar(255) NOT NULL,
    content text NOT NULL,
    createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifiedDate TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (storyID) REFERENCES stories(storyID) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (sceneID)
);