 // var activity = new JustGage({
 //    id: "activity", 
 //    value: 67, 
 //    min: 0,
 //    max: 100,
 //    title: "Activity"
 //  }); 

 //  var impact = new JustGage({
 //    id: "impact", 
 //    value: 57, 
 //    min: 0,
 //    max: 100,
 //    title: "Impact"
 //  }); 


 //   var celebrity = new JustGage({
 //    id: "celebrity", 
 //    value: 27, 
 //    min: 0,
 //    max: 100,
 //    title: "Celebrity"
 //  }); 


 $(document).ready(function () {
    
    var hoverHTMLImpact = '<p><h4>Impact Score Levels </h4><ul>' + '<li> >90: Opinion Maker </li>' +
                        '<li>90-80: Influential</li>' +
                        '<li>80-70: Persuasive</li>' +
                        '<li>70-60: Credible</li>' +
                        '<li>60-50: Acceptable</li>' +
                        '<li><50: Honorable Mention </li>' +
                           '</ul></p>';
    var hoverHTMLCelebrity = '<p><h4>Celebrity Score Levels </h4><ul>' + '<li> >90: Celebrity </li>' +
                        '<li>90-80: Famous</li>' +
                        '<li>80-70: Important</li>' +
                        '<li>70-60: Reputable</li>' +
                        '<li><60: Honourable Mention</li>' +
                           '</ul></p>';
    var hoverHTMLActivity = '<p><h4>Activity Score Levels </h4><ul>' + '<li> >30: Tireless Tweeter Bee </li>' +
                        '<li>30-20: Spirited Tweeter</li>' +
                        '<li>20-10: Active Tweeter</li>' +
                        '<li>10-2: Breezy Tweeter</li>' +
                        '<li><2: Dormant Tweeter</li>' +
                           '</ul></p>';



    $("#impact-openRight").hovercard({
        detailsHTML: hoverHTMLImpact,
        width: 350,
        cardImgSrc: '../images/square.png',
        openOnRight: true
    });

    $("#celebrity-openRight").hovercard({
        detailsHTML: hoverHTMLCelebrity,
        width: 350,
        cardImgSrc: '../images/square.png',
        openOnRight: true
    });

    $("#activity-openRight").hovercard({
        detailsHTML: hoverHTMLActivity,
        width: 350,
        cardImgSrc: '../images/square.png',
        openOnRight: true
    });
});



  function plotactivity(val, bucket)
  {
  	console.log("Plotting activity "+val);
  	var activity = new JustGage({
    id: "activity", 
    value: val, 
    min: 0,
    max: 50,
    title: bucket,
    titleFontColor :"#FFFFFF",
    label: "Activity",
    labelFontColor:"#FFFFFF"
  }); 

  } 

  

    function plotimpact_lboard(val, which, bucket)
  {
  	console.log("Plotting activity "+val);
  	var activity = new JustGage({
    id: "impactg"+which, 
    value: val, 
    min: 0,
    max: 100,
    title: bucket,
    titleFontColor :"#FFFFFF",
    label: "Impact",
    labelFontColor:"#FFFFFF"
  }); 

  } 



    function plotactivity_lboard(val, which, bucket)
  {
  	console.log("Plotting activity "+val);
  	var activity = new JustGage({
    id: "activityg"+which, 
    value: val, 
    min: 0,
    max: 50,
    title: bucket,
    titleFontColor :"#FFFFFF",
    label: "Activity",
    labelFontColor:"#FFFFFF"

  }); 

  } 



    function plotcelebrity_lboard(val, which, bucket)
  {
  	console.log("Plotting activity "+val);
  	var activity = new JustGage({
    id: "celebrityg"+which, 
    value: val, 
    min: 0,
    max: 100,
    title: bucket,
    titleFontColor :"#FFFFFF",
    label: "Celebrity",
    labelFontColor:"#FFFFFF"
  }); 

  } 




    function plotcelebrity(val, bucket)
  {
  	console.log("Plotting celebrity "+val);
  	var activity = new JustGage({
    id: "celebrity", 
    value: val, 
    min: 0,
    max: 100,
    title: bucket,
    titleFontColor :"#FFFFFF",
    label: "Celebrity",
    labelFontColor:"#FFFFFF"
  }); 

  } 



    function plotimpact(val, bucket)
  {
  	console.log("Plotting impact "+val);
  	var activity = new JustGage({
    id: "impact", 
    value: val, 
    min: 0,
    max: 100,
    title: bucket,
    titleFontColor :"#FFFFFF",
    label:"Impact",
    labelFontColor:"#FFFFFF"
  }); 

  } 


  // console.log("score data is "+scoredata.afactor);