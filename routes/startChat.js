const express = require('express');

let router = express.Router();

//Create connection to Heroku Database
let db = require('../utilities/utils').db;



/** Fetch all of the contacts for the given user */
router.get("/", (req, res) => {
    res.type("application/json");
    let friends = [];
    let name = "";
    let count = req.query['count'];
    for(var i = 1; i <= count;i++){
        if(req.query['username'+i] !== undefined){
            friends.push(req.query['username'+i]);
                if(i==1){
                name = req.query['username'+i];
                }else{
                    name = name+','+req.query['username'+i];
                }
        }else{
            return res.send({
                success: false,                
                message: 'Invalid number of arguments'
            });
        }
    }

         
    let query = `INSERT INTO CHATMEMBERS(CHATID,MEMBERID) VALUES($2,$1)`;
    
    db.one('SELECT CHATID FROM CHATS WHERE NAME = $1',[name])
     .then(row => {
        let chatID  = row['chatid'];
        res.send({
            success: true,                
            data: chatID,
            message: 'Already exist chat'
        });
              

     }).catch(()=>{
        db.none('INSERT INTO CHATS(name) VALUES($1)',[name])
        .then(() => {
          // Fetch all of the chats  
          db.one('SELECT CHATID FROM CHATS WHERE NAME = $1',[name])
              .then(row => {
                  var chatId = row['chatid'];
                 for(var x = 0 ; x < count;x++){ 
                        db.one("SELECT MEMBERID FROM MEMBERS WHERE USERNAME = $1", [friends[x]])
                        
                        .then(row => {
                            
                                let params = [row['memberid'],chatId];
                                db.none(query,params).then(()=> {
                                    res.send({
                                        success: true,                
                                        message: 'Inserted the member into chatMembers'
                                    });
                                })
                                .catch(function (err) {
                                    console.log("ERROR Starting the Chat!" + err);
                                    return res.send({
                                        success: false,
                                        message: 'Failed Inserting the'+ (x+1)+'member into chatMembers'
                                    });
                                });    

                            
                            
                            
                            
                
                        })
                        .catch(function (err) {
                            console.log("ERROR Starting Chat!" + err);
                            return res.send({
                                success: false,
                                message: "Could not select memberIDs from members"
                            });
                        });  
                    } 
                    res.send({
                        success: true,                
                        data: chatId,
                        message: 'Started the chatRoom'
                    }); 
              
          })
          .catch(function (err) {
              console.log("ERROR Starting the  Chat!" + err);
              return res.send({
                  success: false,
                  message: "Could not select chatid from chats"
              });
          });
      })
      .catch((err) => {
          res.send({
              success: false,
              message: "Insert into chats failed",
              err: err
          });
      });

     });
       
    // return res.send({
    //     success: false,
    //     message: friends
    // });
    // let sentTo = req.query['sent_to'];
    // let sentFrom = req.query['sent_from'];
    // let chatRoom = sentTo+","+sentFrom;
    // // Inform the user if they didn't enter username or location
    // if (!sentTo || !sentFrom) {
    //     return res.send({
    //         success: false,
    //         message: "Your request was not understand"
    //     });
    // }

    
    //     // Select the username from the Members table so that we can aquire the MemberID
        
    //     let query = `INSERT INTO CHATMEMBERS(CHATID,MEMBERID) VALUES($2,$1)`;
    
    // db.one('SELECT CHATID FROM CHATS WHERE NAME = $1',[chatRoom])
    //  .then(row => {
    //     let chatID  = row['chatid'];
    //     res.send({
    //         success: true,                
    //         data: chatID,
    //         message: 'Started the chat'
    //     });
              

    //  }).catch(()=>{
    //     db.none('INSERT INTO CHATS(name) VALUES($1)',[chatRoom])
    //     .then(() => {
    //       // Fetch all of the chats  
    //       db.one('SELECT CHATID FROM CHATS WHERE NAME = $1',[chatRoom])
    //           .then(row => {
    //               var chatId = row['chatid'];
    //               db.many("SELECT MEMBERID FROM MEMBERS WHERE USERNAME = $1 UNION SELECT MEMBERID FROM MEMBERS WHERE USERNAME = $2", [sentTo,sentFrom])
                
    //               .then(row => {
                      
    //                   for(var i = 0; i<row.length;i++){
    //                     let params = [row[i]['memberid'],chatId];
    //                     db.none(query,params).then(()=> {
    //                         res.send({
    //                             success: true,                
    //                             message: 'Inserted the'+ (i+1)+'member into chatMembers'
    //                         });
    //                     })
    //                     .catch(function (err) {
    //                         console.log("ERROR Starting the Chat!" + err);
    //                         return res.send({
    //                             success: false,
    //                             message: 'Inserted the'+ (i+1)+'member into chatMembers'
    //                         });
    //                     });    

    //                   }
                      
    //                   res.send({
    //                     success: true,                
    //                     data: chatId,
    //                     message: 'Started the chatRoom'
    //                 });
                      
          
    //               })
    //               .catch(function (err) {
    //                   console.log("ERROR Starting Chat!" + err);
    //                   return res.send({
    //                       success: false,
    //                       message: "Could not select memberIDs from members"
    //                   });
    //               });    
              
    //       })
    //       .catch(function (err) {
    //           console.log("ERROR Starting the  Chat!" + err);
    //           return res.send({
    //               success: false,
    //               message: "Could not select chatid from chats"
    //           });
    //       });
    //   })
    //   .catch((err) => {
    //       res.send({
    //           success: false,
    //           message: "Insert into chats failed",
    //           err: err
    //       });
    //   });

    //  });
       
        
   
});



module.exports = router;