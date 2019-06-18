var upVote = io('http://localhost/');

function upvote(i){

  upVote.emit('upvote',parseInt(i));
  console.log('you upvoted:'+i);

}
