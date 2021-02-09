import React, {Component} from 'react';
import {withAuthentication} from '../Session';
import './index.css';
import * as ASCII from './ascii.js';

class MessageOverlay extends Component {
	constructor(props){
		super(props);
		this.state = {
			
			messages:null,
			authUser:null,
		}
		this.overlayOnClick = this.overlayOnClick.bind(this);
		this.setupTypewriter = this.setupTypewriter.bind(this);
	}
	componentDidMount(){
		document.querySelector('#overlay').focus();
		
		this.setupTypewriter(0).type();
		
	}
	setupTypewriter(index) {
		const lines = document.querySelectorAll('#overlay .line');
		const count = lines.length;
		if(index === count) return;
		const line = document.querySelectorAll('#overlay .line')[index];
		const lineMarker = document.querySelectorAll('#overlay .line-marker')[index];
		line.style.display = 'inline-block';
		lineMarker.style.display = 'inline-block';

		
		
		var shouldType = line.classList.contains('type');


		if(!shouldType){

			var k = this.setupTypewriter(index+1);
			if(!!k)k.type();
			return;
		}
		var t = line;


	    var HTML = t.innerHTML;

	    t.innerHTML = "";

	    var cursorPosition = 0,
	        tag = "",
	        writingTag = false,
	        tagOpen = false,
	        typeSpeed = 25,
        tempTypeSpeed = 0,
        setupTypewriter = this.setupTypewriter;

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
	                tempTypeSpeed = (Math.random() * typeSpeed) + 25;
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
	        	if(index < count)
	        		setupTypewriter(index+1).type();
	        }

	    };
	    return {
	    	type:type
	    }
	    
	}
	overlayOnClick(){
		this.props.setGlobalState({showMessage:false,messages:null});
		//document.querySelector('#overlay').style.display = 'none';
	}

	render(){
		const {messages, authUser} = this.props;

		//choose random ASCII art
		const arts = Object.values(ASCII);
		const rArt = arts[Math.floor(Math.random()*arts.length)];


		return (
			<div id="overlay" ref={(overlay) => { this.overlay = overlay; }} className={'crt'} onClick={this.overlayOnClick} onKeyDown={this.overlayOnClick} tabIndex="0">
				
				<pre dangerouslySetInnerHTML={{__html:rArt}}/>
				<br/>
				<br/>
				<table>
					{messages.map(message=>(
						<tr>
							<td className={'line-marker'}>$<span className={'orange'}>@</span>{authUser.Username}::></td>
							<td className={'line ' + (message.type ? 'type' : '')} dangerouslySetInnerHTML={{__html:message.html}}/>
						</tr>
					))}
				</table>

					
				
				
				
				
				
			</div>
		)
	}
}

export default withAuthentication(MessageOverlay);