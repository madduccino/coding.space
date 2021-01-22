import React from 'react';

import LazyImage from '../LazyImage';

import { withAuthentication } from '../Session';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as FILTER from '../../constants/filter';
import * as LEVELS from '../../constants/levels'

 const groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
class LaunchPad extends React.Component {
 constructor(props){
 	super(props);
 	this.state = {
 		loading:true,
 		untutorials: [],
 		cfilter:[
 			FILTER.SCRATCH.toUpperCase()
 		],
 		lfilter:[],
 		textFilter:'',
 		
 	}
 	//console.log("hiya");
 	this.categoryFilterOnChange = this.categoryFilterOnChange.bind(this);
 	this.textFilterOnChange = this.textFilterOnChange.bind(this);
 	this.filterOnClick = this.filterOnClick.bind(this);
 	this.toggleCFilter = this.toggleCFilter.bind(this);
 	this.toggleLFilter = this.toggleLFilter.bind(this);
 }
 
 categoryFilterOnChange(event){
 	const {filter} = this.state;
 	if(event.target.value != '-1'){
 		filter.push(event.target.value);
 		this.setState({filter:filter});	
 	}
 	
 }
 textFilterOnChange(event){

 	this.setState({textFilter:event.target.value});
 	this.forceUpdate();

 }
 filterOnClick(text){
 	const {filter} = this.state;
 	this.setState({filter:filter.filter(f=>f!==text)});

 }
 toggleCFilter(e){
 	const {cfilter} = this.state;
 	if(cfilter.includes(e.target.value))
 		this.setState({cfilter:cfilter.filter(f=>f!==e.target.value)});
 	else {
 		cfilter.push(e.target.value);
 		this.setState({cfilter:cfilter});
 	}
 }
 toggleLFilter(e){
 	const {lfilter} = this.state;
 	if(lfilter.includes(e.target.value))
 		this.setState({lfilter:lfilter.filter(f=>f!==e.target.value)});
 	else {
 		lfilter.push(e.target.value);
 		this.setState({lfilter:lfilter});
 	}
 }
 componentDidMount(){
 	this.props.firebase.untutorials().on('value', snapshot => {
 		const untutsObj = snapshot.val();
 		const untutorials = Object.keys(untutsObj).map(key =>({
 			...untutsObj[key],
 			pid:key,
 		}))
 		this.setState({
 			untutorials: untutorials,
 			loading:false,
 		})
 	})
 	
 }
 componentWillUnmount(){
 	this.props.firebase.untutorials().off();
 }
 render(){
 	
 	const {untutorials, loading, cfilter,lfilter, textFilter} = this.state;
 	var filteredUntutorials = untutorials.filter(untutorial => 
 		untutorial.Status === 'APPROVED' &&
			(cfilter.length === 0 || 
			cfilter.filter(f=>Object.values(untutorial.Categories).includes(f)).length > 0) &&
			(lfilter.length === 0 ||
			lfilter.filter(f=>f == "LEVEL" + untutorial.Level).length > 0) &&
 			untutorial.Title.toLowerCase().includes(textFilter.toLowerCase())
 	);
 	var untutorialLevels = groupBy(filteredUntutorials,'Level');
 	if(loading)
 	  return (<div className="loading">Loading...</div>);
 	//console.log("hiya")
	 
	 return (
	  <section id="launchpad">
	   <div className="filter">
		  {loading && <div className="loading">Loading ...</div>}
		  	{Object.keys(FILTER).map(f => (
		  		<button onClick={this.toggleCFilter} value={f} class={cfilter.includes(f) ? "f" : ""}>{FILTER[f]}</button>
		  	))}
		  	{Object.keys(LEVELS).map(f => (
		  		<button onClick={this.toggleLFilter} value={f} class={lfilter.includes(f) ? "f" : ""}>{LEVELS[f]}</button>
		  	))}
			<input className="search" type='text' onChange={this.textFilterOnChange} placeholder="Search..."/>
			</div>	

        <div className="main">	
	      {Object.keys(untutorialLevels).map(level=>(<>	
			<>
		    <h1>{'Level ' + level}</h1>
			{untutorialLevels[level].sort(untutorial=>untutorial.Priority).reverse().map(untutorial => (
			    <a id={untutorial.key} href={ROUTES.LAUNCHPAD + '/' + untutorial.key} path={'/public/' + untutorial.Author + '/' + untutorial.ThumbnailFilename}>
			    <LazyImage key={untutorial.key} file={this.props.firebase.storage.ref('/public/' + untutorial.Author + '/' + untutorial.ThumbnailFilename)}/>
			    <div>
				<h2 dangerouslySetInnerHTML={{__html:untutorial.Title}}/>
				<div dangerouslySetInnerHTML={{__html:untutorial.Description.replace(/<(.|\n)*?>/g, '').trim()}}/>
			    </div>
		        </a>
			  ))}
			</>
		    </>))}
	    </div>
      </section>
	)
  }
}
export default withFirebase(LaunchPad);