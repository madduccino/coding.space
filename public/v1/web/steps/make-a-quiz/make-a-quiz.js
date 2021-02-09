// Create object to store dog breed information and map answers to dog
var dog = {
  "data": [
    {
      "breed": "golden retriever", 
      "count": 0,
      "pic": "https://www.waagr.org/wp-content/uploads/2017/08/HPortal3.jpg",
      "desc": "You are eager to please and friendly with all. People know they can depend on you, and you know just how to cheer them up!",
    },
    {
      "breed": "irish setter", 
      "count": 0,
      "pic": "https://hdwallsource.com/img/2016/7/irish-setter-dog-wallpaper-pictures-52358-54067-hd-wallpapers.jpg",
      "desc": "You thrive on lots of exercise and athletic activities. You're good-natured and enjoy the company of others. Some may call you stubborn, but you just know what you want!"
    },
    {
      "breed": "chiahuahua", 
      "count": 0,
      "pic": "https://i.ytimg.com/vi/WmY3iUURXlY/maxresdefault.jpg",
      "desc": "You have a quirky sense of humor and easily entertain all of those around you. You are very loyal to the ones you love but can be slightly suspicious of strangers."
    },
    {
      "breed": "pug", 
      "count": 0,
      "pic": "https://cdn.shopify.com/s/files/1/0267/1841/products/canstockphoto12961496_1024x1024.jpg?v=1513162700",
      "desc":  "You have excellent manners and seldom get into mischief. Although you are happy to be around others, you're just as satisfied with a nice solitary nap."
    }]
};

// Create empty array that will keep track of which question was answered
var answered = [];

$(document).ready(function() {
  
 // Call the select function on each question
  select("#one");
  select("#two");
  select("#three");
  select("#four");
  select("#five");

  // Select function - If answer clicked, store in answered array.
  // Check if all questions have been answered. If so, call the showResult function.
  function select(answer) {
    $(answer + " div").click(function() {
      $(answer + " div").removeClass("highlight");
      $(this).addClass("highlight");
      if (answered.indexOf(answer) == -1) answered.push(answer);
      if (answered.length == 5) showResult();
    });
  }

  // Each answer has been assigned a code - gr, is, ch, or pg.
  // When an answer code is selected, increase the dog object's count value.
  function score(answer) {
    if (answer == "gr") {
      dog.data[0].count++;
    } else if (answer == "is") {
      dog.data[1].count++;
    } else if (answer == "ch") {
      dog.data[2].count++;
    } else {
      dog.data[3].count++;
    }
  }
  
  // Find and return the dog breed with the highest count
  function findMax() {
     var max = dog.data[0].count;
     var winner = dog.data[0];
     for (var i = 0; i < dog.data.length; i++) {
       if (dog.data[i].count > max) {
        max = dog.data[i].count
        winner = dog.data[i]
       }
     }
     return winner;
  }
   
  // Result function - find the answer code for each question
  // Call the score function for each answer code
  // Call the findMax function once the score function has tallied up the count
  // Then show the result!
  function showResult() {
    $(".highlight").each(function() {
      score(this.className.split(" ")[0]);
    });
    
    var winner = findMax()
    
    $("#result").show();
    $("#result-title").html("<h3>What Dog Breed Are You?</h3>");
    $("#result-outer-box").addClass("result-outer-box");
    $("#result-inner-box").html(
      "<div><h3 id='result-header'>You Got: " +
        winner.breed +
        "</h3> <p>" +
        winner.desc +
        "</p><button id='reset'>Retake Quiz</button></div> <div><img src=" +
        winner.pic +
        " /></div>"
    );
    $("#result-inner-box").addClass("result-inner-box");
    location.href = "#result-header";
  }
 
  // Create button to play again
  $(document).on("click", "#reset", function() {
    answered = [];
    $(".highlight").each(function() {
      $(this).removeClass("highlight");
 
     
    });
          dog.data.forEach((dog) => {
            dog.count = 0
          })
     $("#result").hide();
      location.href = "#first";
  });
  
  
});
