const {google} = require('googleapis');

function listMessages(auth, userId, query, callback) {
  /*var getPageOfMessages = function(request, result) {
    request.execute(function(resp) {
      result = result.concat(resp.messages);
      var nextPageToken = resp.nextPageToken;
      if (nextPageToken) {
        request = gapi.client.gmail.users.messages.list({
          'userId': userId,
          'pageToken': nextPageToken,
          'q': query
        });
        getPageOfMessages(request, result);
      } else {
        callback(result);
      }
    });
  };*/
  console.log("RRRRRRRRRRRRRR");
  var initialRequest = google.gmail({version: 'v1',auth}).users.messages.list({
    'userId': userId,
    'q': query
  },(err,res)=>{
    if(err) console.log(err);
    else console.log(res.data);
  });
  console.log("RFRFRFRFRFRFRFRFR")
  //getPageOfMessages(initialRequest, []);
}
module.exports = listMessages;