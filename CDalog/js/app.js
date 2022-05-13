var fer = false;
if (!localStorage.getItem('s')) { localStorage.setItem('s', '[]'); }

const st = JSON.parse(localStorage.getItem('s'));
var stoper = true;
const initoptions = {
  inputStream: {
    name: "Live",
    type: "LiveStream",
    target: document.querySelector('#quagga'),
    constraints:{
      facingMode: "environment",
    }  // Or '#yourElement' (optional)
  },
  decoder: {
    readers: ["ean_reader"],
    debug: { drawBoundingBox: false }
  }
};
function dostuff() {

  var et = document.getElementById('booklist');
  st.sort(function (a, b) {
    let x = a.title.toUpperCase(),
      y = b.title.toUpperCase();
    return x == y ? 0 : x > y ? 1 : -1;

  });
  et.innerHTML = "";

  console.log(st);
  for (let i = 0; i < st.length; i++) {

    let t = "<em>"+st[i].title+"</em> By: <em>"+st[i].author+"</em>";
    let e = document.createElement("li");
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
}

let scabot = document.getElementById("scanbut");
scabot.removeAttribute("disabled");
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
Quagga.onDetected(async function (r) {
  if ((r.codeResult.code > 9780000000000 && r.codeResult.code < 9800000000000 && !fer) || r.codeResult.code<1000000000) {
    document.getElementById("cameramodal").style.display = "none";
    Quagga.stop();
    var x = await Book(r);
    let img = document.getElementById("igerite");
    img.src = x.cover;
    document.getElementById("title").innerHTML = x.title;
    document.getElementById("author").innerHTML = x.author;
    document.getElementById("yesay").onclick = function () {
      st.push(x);
      let ser = JSON.stringify(st);
      console.log(st);
      console.log(ser);
      localStorage.setItem('s', ser);
      document.getElementById("myModal").style.display = "none";
      dostuff();

    };
    document.getElementById("nosay").onclick = function () { document.getElementById("myModal").style.display = "none"; };
    document.getElementById("myModal").style.display = "block";
    console.log(x);


    console.log("found");
  } console.log(r.codeResult.code);
});
const CD = async (data) => {
  self.ean = data.codeResult.code;
  let urlthing = "http://musicbrainz.org/ws/2/release/?query=barcode:"+self.ean+"&fmt=json";
  console.log(urlthing);
  let end = {};
  let thing = await fetch(urlthing);
  var obj = await thing.json();
  obj = obj.releases[0];
  end.title = obj.title;
  if(!obj.artist-credit){
    end.artists = [{sortname:"Unknown",name:"Unknown"}];
  }
  else{
    end.artists =[];
    for(let i = 0;i<obj["artist-credit"].length;i++){
      end.artists[i].sortname=obj["artist-credit"][i].artist["sort-name"];
      end.artists[i].name=obj["artist-credit"][i].artist["name"];
    }
  }
  if (!obj.cover){end.cover=""}else{  end.cover = "https://coverartarchive.org/release-group/"+obj["release-group"].id+"/front-500";
}

  Promise.resolve(end);
  return end;


}
dostuff();
