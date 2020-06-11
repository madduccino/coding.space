import React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';


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
	<section id="landing">
	 <div id="rocket"></div>
	 
	  <div className="main">
        <h1>My Coding Space</h1>
	  </div>
	</section>
	)
}
}
export default Landing;