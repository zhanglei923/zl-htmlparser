let fs = require('fs')
let handler = require('./handler')


let slider = []

let inside_self_closing_tag = false;

let inside_tag = false;

let inside_start_tag = false;
let inside_end_tag = false;
let inside_comment = false;
let inside_string = false;

let current_tagname;

let start_tagarr = []
let start_tagname = ''

let end_tagarr = []
let end_tagname = ''

let autoCloseTag = {'meta':1, 'link':1}

let prevChar;
let parseHtml = (char, fultureStr)=>{
    slider.push(char)
    if(slider.length > 50) slider.shift();
    if(char === '<') inside_tag = true;
    if(prevChar === '>') inside_tag = false;
    //<tag ...
    if(prevChar === '<' && char !== '/') {
        inside_start_tag = true;
        inside_end_tag = false;
    } 
    //</tag>
    if(prevChar === '<' && char === '/'){
        inside_start_tag = false;
        inside_end_tag = true;
    }
    //<tag/>
    if(inside_tag &&(prevChar === '/' && char === '>')){
        // inside_start_tag = false;
        // inside_end_tag = false;
        inside_self_closing_tag = true;
    }

    //if(char === '>') inside_start_tag = true;
    let start_stop = false;
    if(inside_start_tag && (char === ' ' || char === '/')){
        start_stop = true;
    }else if(inside_start_tag && char === '>') {
        start_stop = true;
    }
    if(inside_start_tag && !start_stop){
        start_tagname += char;
    }
    if(inside_start_tag && start_stop){
        start_stop = false;
        inside_start_tag = false;
        start_tagarr.push(start_tagname);
        handler.on({ename: 'start_tag', tagname: start_tagname});        
        // if(autoCloseTag[start_tagname.toLowerCase()] && fultureStr.indexOf(`</${start_tagname}>`)<0 && fultureStr.indexOf('/>')<0){
        //     console.log(fultureStr)
        //     handler.on({ename: 'end_tag', tagname: start_tagname});
        // }
        //jsonBuilder(start_tagname,  'start')
        current_tagname = start_tagname;
        start_tagname = ''
    }

    let end_stop = false;
    if(inside_end_tag && char === '>'){
        end_stop = true;
    }
    if(inside_end_tag && !end_stop){
        end_tagname += char;
    }
    if(inside_end_tag && end_stop){
        end_stop = false;
        inside_end_tag = false;
        end_tagname = end_tagname.replace(/^\//, '')
        end_tagarr.push(end_tagname);
        //jsonBuilder(end_tagname,  'end')
        handler.on({ename: 'end_tag', tagname: end_tagname});
        current_tagname = end_tagname;
        end_tagname = '';
    }

    if(inside_self_closing_tag){
        inside_self_closing_tag = false;
        let selfclose_tag = current_tagname;
        end_stop = false;
        inside_end_tag = false;
        end_tagarr.push(selfclose_tag);
        //jsonBuilder(selfclose_tag,  'end')
        handler.on({ename: 'end_tag', tagname: selfclose_tag});
    }

    prevChar = char;
}


var filename = './example-simple.html'
//filename = `./a.txt`

var fd = fs.openSync(filename, 'r');
var bufferSize = 1;
var buffer = Buffer.alloc(bufferSize);
var leftOver = '';
var read, line, idxStart, idx;
let fultureArr = []//往前看10个
while ((read = fs.readSync(fd, buffer, 0, bufferSize, null)) !== 0) {
  let b = buffer.toString('utf8');//buffer.toString('utf8', 0, read);
  //console.log( b)
  fultureArr.push(b)
  if(fultureArr.length > 10) {
      let char = fultureArr.shift();
      //console.log(char, fultureArr.join(''))
      parseHtml(char, fultureArr.join(''))
  }
}
while(fultureArr.length > 0){
    let char = fultureArr.shift();
    //console.log(char, fultureArr.join(''))
    parseHtml(char, fultureArr.join(''))
}

fs.writeFileSync('./_start_.log', start_tagarr.join('\n'))
fs.writeFileSync('./_end_.log', end_tagarr.join('\n'))
fs.writeFileSync('./_tagQueue_.json', JSON.stringify(handler.getQueue()))
//console.log(start_tagarr)