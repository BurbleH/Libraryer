var fer = false;
if (!localStorage.getItem("a")) { localStorage.setItem("a", '[]'); }

var st = JSON.parse(localStorage.getItem("a"));
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
function dostuff() {

  var et = document.getElementById('booklist');
  st.sort(function (a, b) {
    let x = a.artists[0].sortname.toUpperCase(),
      y = b.artists[0].sortname.toUpperCase();
    return x == y ? 0 : x > y ? 1 : -1;

  });
  et.innerHTML = "";
  console.log(st);

  for (let i = 0; i < st.length; i++) {

    let e = document.createElement("li");
    let iger = document.createElement("img");
    let delbut = document.createElement("button");
    let brd = document.createElement("br");
    delbut.innerHTML = "&times;";
    delbut.addEventListener("click", function () {
      st.splice(i, 1);
      localStorage.setItem("a", JSON.stringify(st));
      dostuff();
    });



    iger.src = st[i].cover;
    iger.width = 150;
    e.appendChild(delbut);
    e.appendChild(brd);
    e.appendChild(iger);
    et.appendChild(e);
  }
  let sa = document.getElementById("save");
  let curbul = new Blob([JSON.stringify(st, null, 2)], { type: 'application/json' });
  console.log("potato")
  var curbulink = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(st)); console.log(curbulink);
  sa.addEventListener("click", function () {
    let lin = document.getElementById("alink");
    lin.href = curbulink;
    lin.download = "cds.cattle";
    lin.click();
  });
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
  if (true) {
    document.getElementById("cameramodal").style.display = "none";
    Quagga.stop();
    var x = await CD(r);
    let img = document.getElementById("igerite");
    img.src = x.cover;
    document.getElementById("title").innerHTML = x.title;
    document.getElementById("yesay").onclick = function () {
      st.push(x);
      let ser = JSON.stringify(st);
      console.log(st);
      console.log(ser);
      localStorage.setItem("a", ser);
      document.getElementById("myModal").style.display = "none";
      dostuff();

    };
    document.getElementById("nosay").onclick = function () { document.getElementById("myModal").style.display = "none"; };
    document.getElementById("myModal").style.display = "block";
    console.log(x);
    let list = document.getElementById("persons");
    for (let i = 0; i < x.artists.length; i++) {
      let it = document.createElement("li");
      it.innerHTML = x.artists[i].name;
      list.appendChild(it);
    }

    console.log("found");
  } console.log(r.codeResult.code);
});
const CD = async (data) => {
  self.ean = data.codeResult.code;
  let urlthing = "https://musicbrainz.org/ws/2/release/?query=barcode:" + self.ean + "&fmt=json";
  console.log(urlthing);
  let end = {};
  let thing = await fetch(urlthing);
  var obj = await thing.json();
  obj = obj.releases[0];
  end.title = obj.title;
  if (!obj["artist-credit"]) {
    end.artists = [{ sortname: "Unknown", name: "Unknown" }];
  }
  else {
    end.artists = [];
    for (var i = 0; i < obj["artist-credit"].length; i++) {
      let oj = {};
      oj.sortname = obj["artist-credit"][i].artist["sort-name"];
      oj.name = obj["artist-credit"][i].artist["name"];
      end.artists.push(oj);
      console.log(i);
    }
  }
  end.cover = "https://coverartarchive.org/release-group/" + obj["release-group"].id + "/front-500";


  Promise.resolve(end);
  return end;


}
const fileSelector = document.getElementById('filer');
fileSelector.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file.type.match('application.json')) {
    console.log("we love uploads");
    var reader = new FileReader();
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
