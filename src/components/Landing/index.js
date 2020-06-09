import React from 'react';
class Landing extends React.Component {
 constructor(props){
 	super(props);

 }
 
 handleMouseEnter = () => this.props.setGlobalState({showFooter:false});
	/*$('#scratch-box').fadeIn(250);
	$('#footer').css('display','none');*/
 handleMouseLeave = () => this.props.setGlobalState({showFooter:true})
 render(){


 	return (
	<div>
  <h1>The Coding Space Projects</h1>
	<div className='container'>
    Hey hey
		<div className='section-holder'>

			<section id='scratch'>
				<a id='scratch-img' href='./launchpad' onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}><img className='img-responsive large-img' src='./images/2018scratch.png' alt='Scratch'/></a>
				<div id='scratch-box' className='black-opaque infobox'>Program your own interactive stories, games, and animations with Scratch
					-- and share your creations with others in the online community.
					<p className='info-para green'>We recommend starting here.</p>
				</div>
			</section>

			<section id='woof'>
				<a id='woof-img' href='http://woofjs.com/' onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}><img className='img-responsive large-img' src='./images/2018woof.png' alt='Woof'/></a>
				<div id='woof-box' className='black-opaque infobox'>Build complex games, animations, and apps with WoofJS. It uses JavaScript,
					the language of the web, so you can build for mobile and integrate with APIs and databases.
					<p className='info-para yellow'>We recommend completing two Level 4 Scratch projects before starting with WoofJS.</p>
				</div>
			</section>

			<section id='web'>
				<a id='web-img' href='./web' onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}><img className='img-responsive large-img' src='./images/2018web.png' alt='Web'/></a>
				<div id='web-box' className='black-opaque infobox'>Create websites and web apps using HTML, CSS, and JavaScript.
					<p className='info-para red'>We recommend completing two Level 3+ WoofJS projects before you start with Web projects.</p>
				</div>
			</section>
		</div>

	</div>
	

	
	</div>
	)
}
}
export default Landing;