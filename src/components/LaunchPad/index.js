import React from 'react';

import LazyImage from '../LazyImage';

import { withAuthentication } from '../Session';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as FILTER from '../../constants/filter';


class LaunchPad extends React.Component {
 constructor(props){
 	super(props);
 	this.state = {
 		loading:false,
 		untutorials: [],
 		filter:[],
 		textFilter:'',
 		
 	}
 	//console.log("hiya");
 	this.categoryFilterOnChange = this.categoryFilterOnChange.bind(this);
 	this.textFilterOnChange = this.textFilterOnChange.bind(this);
 	this.filterOnClick = this.filterOnClick.bind(this);

 }
 
 handleMouseEnter = () => this.props.setGlobalState({showFooter:false});
	/*$('#scratch-box').fadeIn(250);
	$('#footer').css('display','none');*/
 handleMouseLeave = () => this.props.setGlobalState({showFooter:true})
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
 	this.setState({ loading: true });

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


 	//console.log("hiya")
 	return (
		<section id="launchpad">
			{/* <a target="_blank" href="http://scratch.mit.edu/create">
				<button id="go-to-scratch" class="btn btn-success">Go to Scratch
				</button>
			</a> */}
			<div className="filter">
			    {loading && <div>Loading ...</div>}
			    {selectedFilters.length != Object.keys(FILTER).length && (
					<select onChange={this.categoryFilterOnChange}>
						<option value='-1'>Filter...</option>
				    	{Object.keys(FILTER).filter(f=>!selectedFilters.includes(f)).map(filterName=><option value={filterName}>{filterName}</option>)}
				    </select>
			    )}
			    
			    <input type='text' onChange={this.textFilterOnChange} placeholder="Search..."/>
				</div>	
			    {selectedFilters.length > 0 && (
			    	<div className="filter-categories">
			    		{selectedFilters.map(f=>(
			    			<a onClick={()=>this.filterOnClick(f)}>{f}</a>
			    		))}
			    	</div>
			    )}	
			<div className="main">	
				{untutorials.filter(untutorial=>
					untutorial.Status === 'APPROVED' && 
					(filter.length === 0 || filter.filter(f=>Object.keys(untutorial.Categories).includes(f)).length > 0) &&
					untutorial.Title.toLowerCase().includes(textFilter.toLowerCase())).map(untutorial => (
						<a id={untutorial.key} href={ROUTES.LAUNCHPAD + '/' + untutorial.key} path={'/public/' + untutorial.Author + '/' + untutorial.ThumbnailFilename}>
							<LazyImage key={untutorial.key} file={this.props.firebase.storage.ref('/public/' + untutorial.Author + '/' + untutorial.ThumbnailFilename)}/>
						<div>
							<h2 dangerouslySetInnerHTML={{__html:untutorial.Title}}/>
							<div dangerouslySetInnerHTML={{__html:untutorial.Description.replace(/<(.|\n)*?>/g, '').trim()}}/>
						</div>
					</a>
				))}
			</div>


    </section>
	)
  }
}
export default withFirebase(LaunchPad);