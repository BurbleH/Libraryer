var fer = false;
//setup localstorage
if (!localStorage.getItem('s')) { localStorage.setItem('s', '[]'); }
//process localstorage
var st = JSON.parse(localStorage.getItem('s'));
//setup quagga
var stoper = true;
const initoptions = {
  inputStream: {
    name: "Live",
    type: "LiveStream",
    target: document.querySelector('#quagga'),
    constraints: {
      facingMode: "environment",
    }  // Or '#yourElement' (optional)
  },
  decoder: {
    readers: ["ean_reader"],
    debug: { drawBoundingBox: false }
  }
};
//define book org. function
function dostuff() {
  //retrieve elements
  var et = document.getElementById('booklist');
  let sorter = document.getElementById("sort");
  //sort books in way defined by user
  st.sort(function (a, b) {
    if (sorter.value = "author") {
      let x = a.authors.map(x => x.toUpperCase()).join(" "),
        y = b.authors.map(x => x.toUpperCase()).join(" ");
      return x == y ? 0 : x > y ? 1 : -1;
    }
    else if (sorter.value = "date") {
      let x = a.timeadded, y = b.timeadded;
      return x == y ? 0 : x > y ? 1 : -1;
    }
    else if (sorter.value = "title") {
      let x = a.title.toUpperCase(),
        y = b.title.toUpperCase();
      return x == y ? 0 : x > y ? 1 : -1;
    }
  });
  //clear list of books
  et.innerHTML = "";
  var filter = document.getElementById("filter");

  //console.log(st);

  //book list item creation
  for (let i = 0; i < st.length; i++) {

    let t = "<em>" + st[i].title + "</em> By: <em>" + st[i].authors.join(", ") + "</em>";
    let e = document.createElement("div");
    let iger = document.createElement("img");
    let delbut = document.createElement("button");
    let brd = document.createElement("br");
    delbut.innerHTML = "&times;";
    delbut.addEventListener("click", function () {
      st.splice(i, 1);
      localStorage.setItem("s", JSON.stringify(st));
      dostuff();
    });

    iger.src = st[i].cover;
    iger.width = 150;
    e.innerHTML = t;
    e.appendChild(delbut);
    e.appendChild(brd);
    e.appendChild(iger);
    et.appendChild(e);

  }
  document.getElementById("cont").innerHTML = "";
}

//define saving feature
let sa = document.getElementById("save");
//define file
let curbul = new Blob([JSON.stringify(st, null, 2)], { type: 'application/json' });
//event things. CATTLE file!
sa.addEventListener("click", function () {
  let curbulink = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(st)); console.log(curbulink);
  let lin = document.getElementById("alink");
  lin.href = curbulink;
  lin.download = "books.cattle";
  lin.click();
});
//get scanning button
let scabot = document.getElementById("scanbut");
//cut the ribbon
scabot.removeAttribute("disabled");
//just the normal onclick
scabot.onclick = function () {
  console.log("starting");
  document.getElementById("cameramodal").style.display = "block";
  Quagga.init(initoptions, function (err) {
    if (err) {
      console.log(err);
      return
    }
    console.log("Initialization finished. Ready to start");
    Quagga.start();
  });
};
//the juicy wonderful book catagorizor via ISBN code mechahnism
Quagga.onDetected(async function (r) {
  //are we actually looking at an ISBN code?
  if ((r.codeResult.code > 9780000000000 && r.codeResult.code < 9800000000000 && !fer) || r.codeResult.code < 1000000000) {
    //stop recording
    document.getElementById("cameramodal").style.display = "none";
    Quagga.stop();
    //our wonderful book item
    var x = await Book(r);
    //cover element
    let img = document.getElementById("igerite");
    //set cover
    img.src = x.cover;
    //set all the text things
    document.getElementById("title").innerHTML = x.title;
    document.getElementById("author").innerHTML = x.authors.join(", ");
    
    let cl=document.getElementById("cat");
    x.genre.forEach(d=>cl.appendChild(document.createElement("option",value)))

    //if the user accepts
    
    document.getElementById("yesay").onclick = function () {
      //add to book list
      st.push(x);
      //make string
      let ser = JSON.stringify(st);
      //debugging stuff
      console.log(st);
      console.log(ser);
      //set to storage
      localStorage.setItem('s', ser);
      //vanish modal
      document.getElementById("myModal").style.display = "none";
      //resort
      dostuff();

    };
    //if user declines
    document.getElementById("nosay").onclick = function () { document.getElementById("myModal").style.display = "none"; };

    //display modal
    document.getElementById("myModal").style.display = "block";
    console.log(x);


    console.log("found");
  } console.log(r.codeResult.code);
});
function listname(lit = [], ner = "name") {
  return lit.map(x => x.name);
}
const Book = async (data) => {
  self.isbn = data.codeResult.code;
  let urlthing = "https://openlibrary.org/api/books?bibkeys=ISBN:" + self.isbn + "&jscmd=data&format=json";
  console.log(urlthing);
  let end = {};
  let thing = await fetch(urlthing);
  var obj = await thing.json();
  console.log(obj)
  obj = obj["ISBN:" + self.isbn + ""];
  end.title = obj.title;
  end.authors = listname(obj.authors, "name");
  if (end.authors = [""]) { end.authors = ["Unknown"]; }

  if (!obj.cover) { end.cover = "" } else {
    end.cover = obj.cover.medium;
  }
  end.isbn = self.isbn;
  end.genre = listname(obj.subjects);
  end.charchar = listname(obj.subject_people);
  end.timeadded = Date.now();
  end.places = listname(obj.subject_places)
  Promise.resolve(end);
  return end;
}
const fileSelector = document.getElementById('filer');
fileSelector.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  if (true) {
    console.log("we love uploads");
    console.log("always read your books");
    reader.addEventListener('load', event => {
      console.log("file uploads are satasfactory");
      st = st.concat(st, JSON.parse(event.target.result));
      dostuff();
    });
  }
  reader.readAsText(file);
});
dostuff();
