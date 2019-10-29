let fs = require('fs')
var filename = './example.html'

var fd = fs.openSync(filename, 'r');
var bufferSize = 1;
var buffer = Buffer.alloc(bufferSize);

let slider = []

let inside_self_closing_tag = false;
let inside_start_tag = false;
let inside_end_tag = false;
let inside_comment = false;
let inside_string = false;

let current_tagname;

let start_tagarr = []
let start_tagname = ''

let end_tagarr = []
let end_tagname = ''

let prevChar;
let parseHtml = (char)=>{
    slider.push(char)
    if(slider.length > 50) slider.shift();

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
    if(prevChar === '/' && char === '>'){
        inside_start_tag = false;
        inside_end_tag = false;
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
        jsonBuilder(start_tagname,  'start')
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
        end_tagarr.push(end_tagname);
        jsonBuilder(start_tagname,  'end')
        current_tagname = end_tagname;
        end_tagname = '';
    }

    if(inside_self_closing_tag){
        inside_self_closing_tag = false;
        let selfclose_tag = current_tagname;
        end_stop = false;
        inside_end_tag = false;
        end_tagarr.push(selfclose_tag);
        jsonBuilder(selfclose_tag,  'end')
    }

    prevChar = char;
}

let htmlJson = {}
let jsonBuilder = (tagname, pos)=>{

}

var leftOver = '';
var read, line, idxStart, idx;
while ((read = fs.readSync(fd, buffer, 0, bufferSize, null)) !== 0) {
  let b = buffer.toString('utf8');//buffer.toString('utf8', 0, read);
  //console.log( b)
  parseHtml(b);
}

fs.writeFileSync('./_start_.log', start_tagarr.join('\n'))
fs.writeFileSync('./_end_.log', end_tagarr.join('\n'))
//console.log(start_tagarr)