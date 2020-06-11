import React from 'react';
class Footer extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			showFooter:props.showFooter ? true : false
		}
		//console.log("footercont" + props.showFooter)

	}
	render(){
		//console.log("footer" + this.state.showFooter);
		if(this.state.showFooter)
			return (
				<div id= "footer">

					{/* <div id="learn-col">
						<div id="start" className="info-modal" style={{marginRight: 7 + 'px'}}>Where do I start?</div>
						<a href="./about.html"><div className="info-modal" id="about">About this site</div></a>
					</div>
					<div className="holder" style={{minHeight: 80 + 'px'}}>
						<div id="start-box" className="black-opaque">
							<p className="info-para">We recommend starting with a Level 1 Scratch project, like
								<a href="./scratch/ghost-busters.html" target="_blank">Ghost Busters
								</a>.
							</p>

							<p className="info-para">If you’re a experienced coder, browse the levels to find a project that's challenging for you.
							</p>
						</div>
					</div>

					<div className="bottom-holder">
						<h4 id="tcs-text">Created by <a href="http://www.thecodingspace.com" target="_blank">The Coding Space</a></h4>
					</div>
					
					<div className="gong">
						<a href="/gong"><img src="/gong_assets/gong.png" alt="Virtual Gong"/></a>
					</div> */}
				</div>	
			)
		return null;
	}
}

export default Footer;