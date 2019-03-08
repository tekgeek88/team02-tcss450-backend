DROP TABLE IF EXISTS Members;
CREATE TABLE Members (MemberID SERIAL PRIMARY KEY,
                      FirstName VARCHAR(255) NOT NULL,
	                  LastName VARCHAR(255) NOT NULL,
                      Username VARCHAR(255) NOT NULL UNIQUE,
                      Email VARCHAR(255) NOT NULL UNIQUE,
                      Password VARCHAR(255) NOT NULL,
                      SALT VARCHAR(255),
                      Verification INT DEFAULT 0
);

DROP TABLE IF EXISTS Contacts;
CREATE TABLE Contacts(ID SERIAL,
                      MemberID_A INT NOT NULL,
                      MemberID_B INT NOT NULL,
                      Verified INT DEFAULT 0,
                      PRIMARY KEY (MemberID_A, MemberID_B),
                      FOREIGN KEY(MemberID_A) REFERENCES Members(MemberID),
                      FOREIGN KEY(MemberID_B) REFERENCES Members(MemberID)
);

DROP TABLE IF EXISTS Chats;
CREATE TABLE Chats (ChatID SERIAL PRIMARY KEY,
                    Name VARCHAR(255)
);

DROP TABLE IF EXISTS ChatMembers;
CREATE TABLE ChatMembers (ChatID INT NOT NULL,
                          MemberID INT NOT NULL,
                          FOREIGN KEY(MemberID) REFERENCES Members(MemberID),
                          FOREIGN KEY(ChatID) REFERENCES Chats(ChatID) ON DELETE CASCADE
);

DROP TABLE IF EXISTS Messages;
CREATE TABLE Messages (MessageID SERIAL PRIMARY KEY,
                       ChatID INT,
                       Message VARCHAR(255),
                       MemberID INT,
                       FOREIGN KEY(MemberID) REFERENCES Members(MemberID),
                       FOREIGN KEY(ChatID) REFERENCES Chats(ChatID),
                       TimeStamp TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
);

DROP TABLE IF EXISTS Locations;
CREATE TABLE Locations (ID SERIAL UNIQUE,
                        MemberID INT NOT NULL,
                        Nickname VARCHAR(255) NOT NULL,
                        Lat DECIMAL,
                        Long DECIMAL,
                        ZIP INT,
                        PRIMARY KEY (MemberID, Nickname),
                        FOREIGN KEY(MemberID) REFERENCES Members(MemberID) ON DELETE CASCADE
);

DROP TABLE IF EXISTS Demo;
CREATE TABLE Demo (DemoID SERIAL PRIMARY KEY,
                        Text VARCHAR(255)
);


DROP TABLE IF EXISTS Push_Token;
CREATE TABLE Push_Token (KeyID SERIAL PRIMARY KEY,
                        MemberID INT NOT NULL UNIQUE,
                        Token VARCHAR(255),
                        FOREIGN KEY(MemberID) REFERENCES Members(MemberID) ON DELETE CASCADE
);


DROP TABLE IF EXISTS VerificationToken;
CREATE TABLE VerificationToken (MemberID INT PRIMARY KEY,
                                Token VARCHAR(255) NOT NULL UNIQUE,
                                createdAt TIMESTAMP NOT NULL DEFAULT NOW(),  
                                FOREIGN KEY(MemberID) REFERENCES Members(MemberID) ON DELETE CASCADE
);