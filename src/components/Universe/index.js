import React from 'react';

import LazyImage from '../LazyImage';

import { withAuthentication } from '../Session';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as FILTER from '../../constants/filter';


class Universe extends React.Component {
 constructor(props){
 	super(props);
 	this.state = {
 		loading:false,
 		projects: [],
 		projectKeys:[],
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
 	filter.push(event.target.value);
 	this.setState({filter:filter});
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
 	const {projects} = this.state;


 	this.props.firebase.projects().on('child_added', snapshot => {
 		const project = snapshot.val();
 		
 		this.props.firebase.profile(project.Author).once('value', snapshot2 => {
 			project.Author = snapshot2.val();
 			projects.push(project);
 			this.setState({
 				projects: projects,
 			
 			})
 		})

 		

 		
 	})
 	
 }
 componentWillUnmount(){
 	this.props.firebase.projects().off();
 }
 render(){
 	
 	const {projects, loading, filter, textFilter} = this.state;
 	const selectedFilters = Object.keys(FILTER).filter(v=>filter.includes(v));


 	//console.log("hiya")
 	return (
		<section id="universe">
			{/* <a target="_blank" href="http://scratch.mit.edu/create">
				<button id="go-to-scratch" class="btn btn-success">Go to Scratch
				</button>
			</a> */}
			<div className="filter">
			    {loading && <div>Loading ...</div>}
			    {selectedFilters.length != Object.keys(FILTER).length && (
					<select onChange={this.categoryFilterOnChange}>
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
				{projects.filter(project=>
					project.Status === 'APPROVED' && 
					(filter.length === 0 || filter.filter(f=>Object.keys(project.Categories).includes(f)).length > 0) && 
					(project.Title.toLowerCase().includes(textFilter.toLowerCase()) || project.Author.DisplayName.toLowerCase().includes(textFilter.toLowerCase())))
					.map(project => (
				
						<a id={project.key} href={project.URL} path={'/public/' + project.Author.key + '/' + project.ThumbnailFilename}>
							<LazyImage key={project.key} file={this.props.firebase.storage.ref('/public/' + project.Author.key + '/' + project.ThumbnailFilename)}/>
						
						<div>
							<h2 dangerouslySetInnerHTML={{__html:project.Title}}/>
							<div dangerouslySetInnerHTML={{__html:project.Description}}/>
						</div>
					</a>
				))}
			</div>


    </section>
	)
  }
}
export default withFirebase(Universe);