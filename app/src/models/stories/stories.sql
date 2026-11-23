CREATE TABLE stories (
    storyID varchar(255) NOT NULL,
    title varchar(255) NOT NULL,
    author varchar(255) NOT NULL,
    genre varchar(255) NOT NULL,
    cover varchar(255) NOT NULL,
    description varchar(255) NOT NULL,
    tags varchar(255) NOT NULL,
    createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedDate TIMESTAMP DEFAULT NULL,
    PRIMARY KEY (storyID)
);