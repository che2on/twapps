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