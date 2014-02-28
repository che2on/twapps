/*
  Jquery Validation using jqBootstrapValidation
   example is taken from jqBootstrapValidation docs 
  */
$(function() {

 // $("input,textarea").jqBootstrapValidation(
 //    {
 //     preventSubmit: true,
 //     submitError: function($form, event, errors) {
 //      // something to have when submit produces an error ?
 //      // Not decided if I need it yet
 //     },
 //     submitSuccess: function($form, event) { },

 //  //     event.preventDefault(); // prevent default submit behaviour
 //  //      // get values from FORM
 //  //      var name = $("input#name").val();  
 //  //      var replytoid = $("input#replytoid").val(); 
 //  //      var message = $("textarea#message").val();
 //  //       var firstName = name; // For Success/Failure Message
 //  //          // Check for white space in name for Success/Fail message
 //  //       if (firstName.indexOf(' ') >= 0) {
	//  //   firstName = name.split(' ').slice(0, -1).join(' ');
 //  //        }        
	//  // $.ajax({
 //  //               url: "./posttweet",
 //  //           	type: "POST",
 //  //           	data: {name: name, replytoid: replytoid, message: message},
 //  //           	cache: false,
 //  //           	success: function(data) {  

 //  //               angular.element(document.getElementById('column1')).scope().$apply(function(scope){
 //  //                 scope.twitts.slice(0,1);
 //  //                 for(var t in scope.twitts)
 //  //                 {
 //  //                   console.log("t..."+scope.twitts[t].id_str);
 //  //                   if(scope.twitts[t].id_str == data.in_reply_to_status_id_str )
 //  //                   {
 //  //                     console.log("slicing... "+scope.twitts[t].text);
 //  //                    // scope.twitts.slice(scope.twitts.indexOf(scope.twitts[t]),1);
 //  //                    // scope.twitts.push({text:"deleted"});
 //  //                    // scope.delete(scope.twitts[t]);

 //  //                     scope.twitts.slice(scope.twitts[t],1);
 //  //                   }
 //  //                 }

 //  //                 });
 //  //           	// Success message
 //  //           	   $('#success').html("<div class='alert alert-success'>");
 //  //           	   $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
 //  //           		.append( "</button>");
 //  //           	  $('#success > .alert-success')
 //  //           		.append("<strong>Your message has been sent. </strong>");
 // 	// 	  $('#success > .alert-success')
 // 	// 		.append('</div>');
 						    
 // 	// 	  //clear all fields
 // 	// 	  $('#contactForm').trigger("reset");
 // 	//       },
 // 	   error: function() {		
 // 		// Fail message

     

 // 		 $('#success').html("<div class='alert alert-danger'>");
 //            	$('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
 //            	 .append( "</button>");
 //            	$('#success > .alert-danger').append("<strong>Sorry. Sending message to "+firstName+" failed. </strong>");
 // 	        $('#success > .alert-danger').append('</div>');
 // 		//clear all fields
 // 		$('#contactForm').trigger("reset");
 // 	    },
 //           })
 //         },
 //         filter: function() {
 //                   return $(this).is(":visible");
 //         },
 //       });

 //      $("a[data-toggle=\"tab\"]").click(function(e) {
 //                    e.preventDefault();
 //                    $(this).tab("show");
 //        });
  });
 

/*When clicking on Full hide fail/success boxes */ 
$('#name').focus(function() {
     $('#success').html('');
  });
