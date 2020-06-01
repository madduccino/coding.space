import React, {Component} from 'react';
import {withAuthentication} from '../Session';
import AuthUserContext from '../Session/context';
import './index.css';
import * as ASCII from './ascii.js';

class MessageOverlay extends Component {
	constructor(props){
		super(props);
		this.state = {
			
			message:null,
			instantMessage:null,
			authUser:null,
		}
		this.overlayOnClick = this.overlayOnClick.bind(this);
	}
	componentDidMount(){
		this.setupTypewriter().type();
	}
	setupTypewriter() {
		var t = document.getElementById('typewriter');


	    var HTML = t.innerHTML;

	    t.innerHTML = "";

	    var cursorPosition = 0,
	        tag = "",
	        writingTag = false,
	        tagOpen = false,
	        typeSpeed = 15,
        tempTypeSpeed = 0;

	    var type = function() {
        
	        if (writingTag === true) {
	            tag += HTML[cursorPosition];
	        }

	        if (HTML[cursorPosition] === "<") {
	            tempTypeSpeed = 0;
	            if (tagOpen) {
	                tagOpen = false;
	                writingTag = true;
	            } else {
	                tag = "";
	                tagOpen = true;
	                writingTag = true;
	                tag += HTML[cursorPosition];
	            }
	        }
	        if (!writingTag && tagOpen) {
	            tag.innerHTML += HTML[cursorPosition];
	        }
	        if (!writingTag && !tagOpen) {
	            if (HTML[cursorPosition] === " ") {
	                tempTypeSpeed = 0;
	            }
	            else {
	                tempTypeSpeed = (Math.random() * typeSpeed) + 50;
	            }
	            t.innerHTML += HTML[cursorPosition];
	        }
	        if (writingTag === true && HTML[cursorPosition] === ">") {
	            tempTypeSpeed = (Math.random() * typeSpeed) + 50;
	            writingTag = false;
	            if (tagOpen) {
	                var newSpan = document.createElement("span");
	                t.appendChild(newSpan);
	                newSpan.innerHTML = tag;
	                tag = newSpan.firstChild;
	            }
	        }

	        cursorPosition += 1;
	        if (cursorPosition < HTML.length - 1) {
	            setTimeout(type, tempTypeSpeed);
	        }
	        else{
	        	//display instant text
	        		var instant = document.querySelector('#instant');
	        		if(!!instant)
	        			instant.style.display = 'block';
	        }

	    };

	    return {
	        type: type
	    };
	    type();
	}
	overlayOnClick(){
		this.props.setGlobalState({showMessage:false,message:null});
		//document.querySelector('#overlay').style.display = 'none';
	}

	render(){
		const {message,instantMessage} = this.props;
		//choose random ASCII art
		const arts = Object.values(ASCII);
		const rArt = arts[Math.floor(Math.random()*arts.length)];


		return (
			<div id="overlay" className={'crt'} onClick={this.overlayOnClick} onKeyPressed={this.overlayOnClick} tabIndex="0">
				<pre dangerouslySetInnerHTML={{__html:rArt}}/>
	
				{!!message && (
					<pre id="typewriter" className={'type'} dangerouslySetInnerHTML={{__html:message}}/>
				)}
				{!!instantMessage && (
					<pre id="instant" className={'type'} dangerouslySetInnerHTML={{__html:instantMessage}}/>
				)}
				
				
				
			</div>
		)
	}
}

export default withAuthentication(MessageOverlay);