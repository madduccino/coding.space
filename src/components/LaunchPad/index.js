import React from 'react';

import LazyImage from '../LazyImage';

import { withAuthentication } from '../Session';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as FILTER from '../../constants/filter';

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
 		filter:[
 			FILTER.SCRATCH.toUpperCase()
 		],
 		textFilter:'',
 		
 	}
 	//console.log("hiya");
 	this.categoryFilterOnChange = this.categoryFilterOnChange.bind(this);
 	this.textFilterOnChange = this.textFilterOnChange.bind(this);
 	this.filterOnClick = this.filterOnClick.bind(this);

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
 	
 	const {untutorials, loading, filter, textFilter} = this.state;
 	const selectedFilters = Object.keys(FILTER).filter(v=>filter.includes(v));
 	var filteredUntutorials = untutorials.filter(untutorial => 
 		untutorial.Status === 'APPROVED' &&
			(filter.length === 0 || 
			filter.filter(f=>Object.values(untutorial.Categories).includes(f)).length > 0) &&
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
			{selectedFilters.length != Object.keys(FILTER).length && (
			<select onChange={this.categoryFilterOnChange}>
			  <option value='-1'>Filter...</option>
			  {Object.keys(FILTER).filter(f=>!selectedFilters.includes(f)).map(filterName=>
			  <option value={filterName}>{FILTER[filterName]}</option>)}
				</select>
			)}
			<input className="search" type='text' onChange={this.textFilterOnChange} placeholder="Search..."/>
			</div>	
	   {selectedFilters.length > 0 && (
	     <div className="filter-categories">
		  {selectedFilters.map(f=>(
		    <a onClick={()=>this.filterOnClick(f)}>{FILTER[f]}</a>
		  ))}
	     </div>
	    )}		
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