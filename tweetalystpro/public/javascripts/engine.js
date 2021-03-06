/**
 * Created with JetBrains WebStorm.
 * User: SantiagoPC
 * Date: 25/08/13
 * Time: 13:38
 * To change this template use File | Settings | File Templates.
 */


var proApp = angular.module('proApp', [] );
var SCREEN_NAME= "";
var free_replies=200;

proApp.filter('orderObjectBy', function(){
 return function(input, attribute) {
    if (!angular.isObject(input)) return input;

    var array = [];
    for(var objectKey in input) {
        array.push(input[objectKey]);
    }

    array.sort(function(a, b){
        a = parseInt(a[attribute]);
        b = parseInt(b[attribute]);
        return a - b;
    });
    return array;
 }
});


proApp.filter('with', function() {
  return function(items, field) {
        var result = {};
        angular.forEach(items, function(value, key) {
            if (!value.hasOwnProperty(field)) {
                result[key] = value;
            }
        });
        return result;
    };
});


proApp.filter('bytabs', function() {
    return function(twitts) {
      var out = [];

        for(var t in twitts)
        {
          if(t.text.length < 10)
            out.push(t);
        }
      //tweets.splice(0,1);
     // out.push (  { text:"hey"});
      // Filter logic here, adding matches to the out var.
      return out;
    }
  });


proApp.directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        console.log("triggered");
        console.log("elm is "+elm);
        for(var i=0; i <elm.length; i++)
        {
          console.log("Elms are "+elm[i]);
        }
        var raw = elm[0];

        elm.bind('scroll', function() {
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
});



// angular.module('proApp', []).directive('whenScrolled', function() {
//     return function(scope, elm, attr) {
//         var raw = elm[0];

//         var funCheckBounds = function(evt) {
//             console.log("event fired: " + evt.type);
//             var rectObject = raw.getBoundingClientRect();
//             if (rectObject.bottom === window.innerHeight) {
//                 scope.$apply(attr.whenScrolled);
//             }

//         };
        
//         angular.element(window).bind('scroll load', funCheckBounds);
        
        
//     };
// });


proApp.service('selectionService', function($rootScope) {
  var selected_template = "empty";
  var selected_tweet = "empty";
  var replied_tweet = "";

  this.addTemplate = function(newObj) {
      console.log("newOj is "+newObj.template_text)
      selected_template = newObj;
      $rootScope.$broadcast('someEvent'); 
  };
  this.getTemplate = function(){
      return selected_template;
  };

  this.addTweet = function(newObj) {
      selected_tweet = newObj;
      $rootScope.$broadcast('someotherEvent');
  }

  this.getTweet = function() {
      return selected_tweet;
  }

  this.removeRepliedTweet = function(newObj)
   {
        replied_tweet = newObj;
        $rootScope.$broadcast('removeOnReply');
   }

   this.getRepliedTweet = function() {
        return replied_tweet;
   }

   this.setInboxloadCompleteFlag = function()
   {
      $rootScope.$broadcast('SetupComplete');
      return "success";
   }

});

proApp.controller('ClickToEditCtrl' , function ClickToEditCtrl($scope)
{
    $scope.t.template_text = "Welcome to this demo!";
});


function parseTwitterDate(aDate)
{ 
  console.log(aDate);
  return new Date(Date.parse(aDate.replace(/( \+)/, ' UTC$1')));
  //sample: Wed Mar 13 09:06:07 +0000 2013 
}

var firsttime = 0;
var priorityfirsttime =0;
var newuserfirsttime =0;

proApp.controller('PriorityTweetFeed',  function ($rootScope, $scope, $http, selectionService) 
{

       $scope.prioritytwitts =[];

       $scope.$on('SetupComplete', function()
       {


          console.log("Refreshing the priority new data!");
          var currenttime = new Date().getTime();
          $http.get('/getnextprioritytweets?time='+currenttime).success(function(data) {
 
          for(d in data)
          {
          console.log("priority is "+data[d].priority);
          data[d].time = +new Date(data[d].created_at);
          data[d].time = ""+data[d].time;
          }
          $scope.prioritytwitts = data;

          
         });
          
       });


        $scope.dismissTweet = function(tweet)
        {
               console.log("Trying to dismiss tweet "+tweet.text);
               $http.get('/dismisstweet?id='+tweet.id_str+"&sec=priority").success(function(data)
                { 
                  console.log("dismissed "+data) 

                      for(t in $scope.prioritytwitts)
                     {
                        if($scope.prioritytwitts[t].id_str == tweet.id_str)
                        {
                             $scope.prioritytwitts.splice($scope.prioritytwitts.indexOf($scope.prioritytwitts[t]),1);
                        }
                    }

                } );
        }


        $scope.setMaster = function(section)
        {
          selectionService.addTweet(section);
        }



        $scope.delete = function(tmp)
        {
            
            console.log("attempting to delete.. "+tmp.text);
            $scope.prioritytwitts.pop(tmp);
            //return $scope.twitts;
          //  $scope.$apply();
        }

        $scope.$watch("prioritytwitts", function(){

        if($scope.prioritytwitts.length < 5 && $scope.prioritytwitts.length >0) { console.log("less than 5"); $scope.loadImages();}
        }, true);

        $scope.loadImages = function()
        {
            if(priorityfirsttime==0) {priorityfirsttime = 1; return; }

           var lasttweet = $scope.prioritytwitts[$scope.prioritytwitts.length-1]
           console.log("load images triggered");
            $http.get('/getnextprioritytweets?time='+lasttweet.time).success(function(data) 
            {

             //  for(d in data) 
             //  {
             //    data[d].created_stamp = parseTwitterDate(data[d].created_at);
             //    data[d].timestamp = +new Date(data[d].created_at);
             // }
            $scope.prioritytwitts = $scope.prioritytwitts.concat(data);
      
            });
            // if (in_progress){
            //     var url = '/api/v1/files.json';
            //     if ($scope.next_page) {
            //         url = $scope.next_page;
            //     }
            //     $http.get(url).success(function(data) {
            //         $scope.images = $scope.images.concat(data.items);
            //         $scope.next_page = data.nextPageInternal;

            //         if (!$scope.next_page) {
            //             in_progress = false;
            //         }
            //     });
            // }
        };


         $scope.loadImages();






});


proApp.controller('NewUsersTweetFeed',  function ($rootScope, $scope, $http, selectionService) 
{

       $scope.newusertwitts =[];

       $scope.$on('SetupComplete', function()
       {


          console.log("Refreshing the newuser new data!");
          var currenttime = new Date().getTime();
          $http.get('/getnextnewusertweets?time='+currenttime).success(function(data) {
 
          for(d in data)
          {
          console.log("new user  is "+data[d].newuser);
          data[d].time = +new Date(data[d].created_at);
          data[d].time = ""+data[d].time;
          }
          $scope.newusertwitts = data;

          
         });
          
       });


           $scope.dismissTweet = function(tweet)
        {
               console.log("Trying to dismiss tweet "+tweet.text);
               $http.get('/dismisstweet?id='+tweet.id_str+"&sec=new").success(function(data)
                { 
                  console.log("dismissed "+data) 

                      for(t in $scope.newusertwitts)
                     {
                        if($scope.newusertwitts[t].id_str == tweet.id_str)
                        {
                             $scope.newusertwitts.splice($scope.newusertwitts.indexOf($scope.newusertwitts[t]),1);
                        }
                    }

                } );
        }


        $scope.setMaster = function(section)
        {
          selectionService.addTweet(section);
        }

        $scope.delete = function(tmp)
        {
            
            console.log("attempting to delete.. "+tmp.text);
            $scope.newusertwitts.pop(tmp);
            //return $scope.twitts;
          //  $scope.$apply();
        }


        $scope.$watch("newusertwitts", function(){

        if($scope.newusertwitts.length < 5 && $scope.newusertwitts.length >0) { console.log("less than 5"); $scope.loadImages();}
        }, true);


        $scope.loadImages = function()
        {
            if(newuserfirsttime==0) {newuserfirsttime = 1; return; }

           var lasttweet = $scope.newusertwitts[$scope.newusertwitts.length-1]
           console.log("load images triggered");
            $http.get('/getnextnewusertweets?time='+lasttweet.time).success(function(data) 
            {

             //  for(d in data) 
             //  {
             //    data[d].created_stamp = parseTwitterDate(data[d].created_at);
             //    data[d].timestamp = +new Date(data[d].created_at);
             // }
            $scope.newusertwitts = $scope.newusertwitts.concat(data);
      
            });
            // if (in_progress){
            //     var url = '/api/v1/files.json';
            //     if ($scope.next_page) {
            //         url = $scope.next_page;
            //     }
            //     $http.get(url).success(function(data) {
            //         $scope.images = $scope.images.concat(data.items);
            //         $scope.next_page = data.nextPageInternal;

            //         if (!$scope.next_page) {
            //             in_progress = false;
            //         }
            //     });
            // }
        };


         $scope.loadImages();






});



proApp.controller('TweetFeed',  function ($rootScope, $scope, $http, selectionService) 
{
  $scope.twitts = [];

  var currenttime = new Date().getTime();
  $http.get('/setupunattendedtweets').success(function(data) 
  {
      // selectionService.setInboxloadCompleteFlag();
        $rootScope.$broadcast('SetupComplete');

        $http.get('/getnextunattendedtweets?time='+currenttime).success(function(data) {


        for(d in data)
        {
        console.log("priority is "+data[d].priority);
        data[d].time = +new Date(data[d].created_at);
        data[d].time = ""+data[d].time;
        }
        $scope.twitts = data;
        
       });
  });



   $scope.filterByPriority = function(t)
    {

      console.log("t is "+t.text);
      if(t.text < 100 )
      {
        return $scope.twitts.indexOf(t);
      }

      
    };



    var socket = io.connect('http://tweetaly.st:3001');
    window.socket = socket;
    socket.on('newTwitt', function (item) 
    {
        console.log("pushing .. "+item);
        item.created_stamp = parseTwitterDate(item.created_at);
        item.timestamp = +new Date(item.created_at);
        console.log(item.created_stamp);
        $scope.twitts.push(item);
        $scope.$apply();
        $('#chatAudio')[0].play();

    })


    $scope.dismissTweet = function(tweet)
    {
           console.log("Trying to dismiss tweet "+tweet.text);
           $http.get('/dismisstweet?id='+tweet.id_str+"&sec=all").success(function(data)
            { 
              console.log("dismissed "+data) 

                  for(t in $scope.twitts)
                 {
                    if($scope.twitts[t].id_str == tweet.id_str)
                    {
                         $scope.twitts.splice($scope.twitts.indexOf($scope.twitts[t]),1);
                    }
                }

            } );
    }

    $scope.setMaster = function(section)
    {
    selectionService.addTweet(section);
    }

     $scope.delete = function(tmp)
     {
        
        console.log("attempting to delete.. "+tmp.text);
        console.log($scope.twitts);
        $scope.twitts.pop(tmp);
        //return $scope.twitts;
      //  $scope.$apply();
     }

     $scope.$watch("twitts", function(){

         if($scope.twitts.length < 5 && $scope.twitts.length >0) { console.log("less than 5"); $scope.loadImages();}
    }, true);
    

    
    $scope.loadImages = function()
    {
        if(firsttime==0) {firsttime = 1; return; }

       var lasttweet = $scope.twitts[$scope.twitts.length-1]
       console.log("load images triggered");
        $http.get('/getnextunattendedtweets?time='+lasttweet.time).success(function(data) 
        {

         //  for(d in data) 
         //  {
         //    data[d].created_stamp = parseTwitterDate(data[d].created_at);
         //    data[d].timestamp = +new Date(data[d].created_at);
         // }
        $scope.twitts = $scope.twitts.concat(data);
  
        });
        // if (in_progress){
        //     var url = '/api/v1/files.json';
        //     if ($scope.next_page) {
        //         url = $scope.next_page;
        //     }
        //     $http.get(url).success(function(data) {
        //         $scope.images = $scope.images.concat(data.items);
        //         $scope.next_page = data.nextPageInternal;

        //         if (!$scope.next_page) {
        //             in_progress = false;
        //         }
        //     });
        // }
    };

    //TweetFeed.$inject = ['$scope', '$http'];

      $scope.loadImages();




     $scope.remove = function(tmp)
     {
       
     }

     $scope.scrollnow = function(tmp)
     {
       console.log("....scrolling...... ");
     }

     $scope.$on('removeOnReply', function(event, ms)
     {
         
              //  alert("replied tweet text is "+selectionService.getRepliedTweet().text);
               //  console.log();
               //console.log(tmp.text);
                for(t in $scope.twitts)
                 {
                    if($scope.twitts[t].id_str == selectionService.getRepliedTweet().in_reply_to_status_id_str)
                    {
                         $scope.twitts.splice($scope.twitts.indexOf($scope.twitts[t]),1);
                    }
                }
     });

   

   // $scope.$apply();
});

proApp.controller('Templates', function($rootScope, $scope, $http, selectionService)
{
    // $scope.templates = [ 
    // {template_name:"Template 1", template_text:"We apologize for the interruption."} ,
    // {template_name:"Template 2", template_text:"Thank you for contacting us."} ,
    // {template_name:"Template 3", template_text:"We will get back to you shortly."} ,
    // {template_name:"Template 4", template_text:"Please DM your phone number."} ,
    // {template_name:"Template 5", template_text:"Welcome. Have a good day!"} ,
    // {template_name:"Template 6", template_text:"Kindly be patient we are looking into your issue."} ,
    // ];

        $http.get('/verify').success(function(data) 
        {

            console.log("data screen name "+data.screen_name);
            SCREEN_NAME = data.screen_name;
            $http.get('/downloadtemplates?screen_name='+SCREEN_NAME).success(function(data) {
            $scope.templates = data;
            });

        });


   

      $scope.$on('saveEvent', function()
       {
          console.log("Refreshing with new data!");
          $http.get('/downloadtemplates?screen_name='+SCREEN_NAME).success(function(data) {
          $scope.templates = data;
          $('#myModal').modal('hide');
        });
      });



    $scope.openModal = function(tmp)
    {
        console.log("tmp is"+tmp.template_text);
        $rootScope.$broadcast('openmodal',tmp);
    }

    $scope.setTemplate = function(tmp)
    {

        console.log("selected template is "+tmp.template_text);
        selectionService.addTemplate(tmp);
        
    }



    $scope.isSelected = function(tmp)
    {
         return selectionService.addTemplate(tmp);
       // return $scope.selectedtemplate = tmp.template_text;
    }

});

 


proApp.controller('ReplyController', function($scope,$http,selectionService) 
{
    $scope.user = { message:"" , name:"" , replytoid:null};
    console.log("got this  "+selectionService.getTemplate());
    $scope.$on('someEvent', function(event, e)
    {
    console.log("does it work? "+selectionService.getTemplate().template_text);
    $scope.template = selectionService.getTemplate();
    $scope.user.message = $scope.template.template_text;
    });

    $scope.$on('someotherEvent', function(event, e)
    {
    console.log("does it work? "+selectionService.getTweet());
    $scope.tweet = selectionService.getTweet();
    $scope.user.replytoid = $scope.tweet.id_str;
  //  var data = $scope.tweet;
      if($scope.tweet.hasOwnProperty("entities"))
      if($scope.tweet.entities.hasOwnProperty("user_mentions"))
      {
                    console.log("data.entities.user_mentions.screen_name "+$scope.tweet.entities.user_mentions);
                //    console.log("no 1... is "+data.entities.user_mentions[0].screen_name);
                   // console.log("no 1... is "+)
                    var found = 0;
                    var names = "@"+$scope.tweet.user.screen_name;
                    
                   // if($scope.tweet.entities.user_mentions.length == 1) $scope.user.name = $scope.tweet.user.screen_name;
                   // else
                    {
                       for(var i=0; i<$scope.tweet.entities.user_mentions.length; i++)
                       {
                        console.log("mentioned name is "+$scope.tweet.entities.user_mentions[i].screen_name);
                        if($scope.tweet.entities.user_mentions[i].screen_name == SCREEN_NAME) 
                        {

                        }
                        else
                        {
                           names += " @"+$scope.tweet.entities.user_mentions[i].screen_name;
                        }
                       }  
                    }    

                    $scope.user.name = names;     
      }
      else
      {
       // $scope.user.name = $scope.tweet.user.screen_name;
      }

    });


   $scope.clearview = function(user)
   {
    $scope.user = { message:"" , name:"" , replytoid:null};
    $('#contactForm').trigger("reset");
     $('#remaining').html( '139 characters remaining');
   // validateCharacters();


    // $scope.user.name = "";
    // $scope.user.message = "";
    // $('#name').empty();
    // $('#message').empty();
    // $('#contactForm').trigger("reset");
    console.log("View cleared!");

   }


   $scope.update = function(user) 
   {
        $scope.master = angular.copy(user);

        // {name: name, replytoid: replytoid, message: message}

        var postData =user;
        $http({
        url: './posttweet',
        method: "POST",
        data: jQuery.param(user),
        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        })
     .then(function(response) 
        {

            
             selectionService.removeRepliedTweet(response.data);
              //  //            // Success message
                 $('#success').html("<div class='alert alert-success'>");
                 $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                  .append( "</button>");
                $('#success > .alert-success')
                  .append("<strong>Your message has been sent. </strong>");
        $('#success > .alert-success')
          .append('</div>');
        $('#contactForm').trigger("reset");
           // success
                       $('#messagebox').empty();
                      $('#messagebox').html("<div class='alert alert-danger'>");
                     $('#messagebox > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                      .append( "</button>");
                     $('#messagebox > .alert-danger').append("<strong>You have ");
                     $('#messagebox > .alert-danger').append(free_replies-response.data.replycounter)
                     $('#messagebox > .alert-danger').append(" Power replies remaining!</strong>");
                     $('#messagebox > .alert-danger').append('</div>');

        }, 
        function(response)
        { // optional
            // failed

               $('#success').html("<div class='alert alert-danger'>");
                     $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                      .append( "</button>");
                     $('#success > .alert-danger').append("<strong>Sorry. Sending message failed. </strong>");
                     $('#success > .alert-danger').append('</div>');
                 //clear all fields
                 $('#contactForm').trigger("reset");
        }
    );
    }

     $(document).ready(function() {
    var text_max = 140;
    $('#remaining').html(text_max + ' characters remaining');

    $('#message').keyup(function() {
        var text_length = $('#message').val().length;
        var text_remaining = text_max - text_length;

        $('#remaining').html(text_remaining + ' characters remaining');
    });
});

});


   


proApp.controller('ModalController', function($rootScope, $scope, $http)
{

    $scope.$on('openmodal', function(event, tmp)
    {
        var templateobject = {"Modal_title":tmp.template_name, "Modal_content":tmp.template_text};
        console.log("rec..");
        $scope.data = templateobject;
        console.log("received data from broadcast"+tmp.template_text);
    }
    );


    $scope.saveChanges =  function()
    {
       
        $http.get('/updatetemplate?template_name='+$scope.data.Modal_title+'&template_text='+$scope.data.Modal_content).success(function(data) {
       // $scope.templates = data; 
         console.log("success");
          $rootScope.$broadcast('saveEvent');

        });
    }

});

 

function mentionApp($scope) 
{
    $scope.twitts = [
           
    ];

    var socket = io.connect('http://localhost:3001');
    window.socket = socket;
    socket.on('menTwitt', function (item)
    {
        item = {user: {screen_name: 'new'}, text: 'new!'};
        console.log("item is "+item);
        $scope.twitts.push(item);
        console.log("pushing tweets");
        $scope.$apply();
    })  

    

}

proApp.controller('REALReplyController', function replyApp($scope)
{
    $scope.twitts = [];
    var socket = io.connect('http://localhost:3001');
    window.socket = socket;
    socket.on('repTwitt', function(item)
    {
        console.log("item is "+item);
        $scope.twitts.push(item);
        console.log("pushing rep tweets");
        $scope.$apply();

    })
});

proApp.controller('REALFavoriteController', function favApp($http, $scope)
{
    $http.get('/realrts').success(function(data) 
    {
        $scope.twitts = data;
    });

    $scope.twitts = [];
    var socket = io.connect('http://localhost:3001');
    window.socket = socket;
    socket.on('favTwitt', function(item)
    {
        console.log("item is "+item);
        $scope.twitts.push(item);
        console.log("pushing fav tweets");
        $scope.$apply();

    })
});

proApp.controller('REALFollowerController', function followApp($http, $scope)
{
    $http.get('/realfollowers').success(function(data) 
    {
        $scope.twitts = data;
    });


    $scope.twitts = [];
    var socket = io.connect('http://localhost:3001');
    window.socket = socket;
    socket.on('followTwitt', function(item)
    {
        console.log("item is "+item);
        $scope.twitts.push(item);
        console.log("pushing follow tweets");
        $scope.$apply();

    })

});


proApp.controller('REALDMController', function directApp($http, $scope)
{
    $http.get('/realdms').success(function(data) 
    {
        $scope.twitts = data;
    });
    $scope.twitts = [];
    var socket = io.connect('http://localhost:3001');
    window.socket = socket;
    socket.on('directTwitt', function(item)
    {
        console.log("item is "+item);
        $scope.twitts.push(item);
        console.log("pushing direct tweets");
        $scope.$apply();

    })

});

function retweetedApp($scope)
{
    $scope.twitts = [];
    var socket = io.connect('http://localhost:3001');
    window.socket = socket;
    socket.on('rtTwitt' , function(item)
    {
        console.log("item is "+item);
        $scope.twitts.push(item);
        console.log("pushing retweeted tweets");
        $scope.$apply();

    })
}

