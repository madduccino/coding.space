import React from 'react';

import LazyImage from '../LazyImage';

import { withAuthentication } from '../Session';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as CATEGORIES from '../../constants/categories';


class Universe extends React.Component {
 constructor(props){
 	super(props);
 	this.state = {
 		loading:true,
 		projects: [],
 		projectKeys:[],
 		filter:[],
 		classFilter:false,
 		classMembers:null,
 		textFilter:'',
 		
 	}
 	//console.log("hiya");
 	this.categoryFilterOnChange = this.categoryFilterOnChange.bind(this);
 	this.textFilterOnChange = this.textFilterOnChange.bind(this);
 	this.filterOnClick = this.filterOnClick.bind(this);
 	this.onClassFilterChange = this.onClassFilterChange.bind(this);

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
 	const {projects} = this.state;


 	this.props.firebase.projects().on('child_added', snapshot => {
 		const project = snapshot.val();
 		
 		this.props.firebase.profile(project.Author).once('value', snapshot2 => {
 			project.Author = snapshot2.val();
 			projects.push(project);
 			this.setState({
 				projects: projects,
 				loading:false
 			
 			})
 		})

 		

 		
 	})
 	
 }
 componentWillUnmount(){
 	this.props.firebase.projects().off();
 }
 onClassFilterChange(){
 	const {classFilter,classMembers} = this.state;
 	const {authUser} = this.props;
 	if(classFilter)
 		this.setState({classFilter:false});
 	else{
 		if(!classMembers){
 			this.props.firebase.classes().once('value',snapshot=>{
 				let classMembers = [];
 				let classes = snapshot.val();

 				let classesWithYou = Object.keys(classes)
 					.filter(clazz=>Object.keys(classes[clazz].Members).includes(authUser.uid));
 				if(Object.keys(classesWithYou).length>0)
 				{
 					classesWithYou.forEach(clazz=>{

 						classMembers = classMembers.concat(Object.keys(classes[clazz].Members));
 					})
 					this.setState({classMembers:classMembers,classFilter:true});
 				}
 				
 			})
 		}
 		else
 			this.setState({classFilter:true});

 	}


 }
 render(){
 	
 	const {projects, loading, filter, textFilter,classFilter,classMembers} = this.state;
 	const selectedFilters = Object.keys(CATEGORIES).filter(v=>filter.includes(v));

	if(loading)
		return (<div className="loading">Loading ...</div>);
 	
 	return (
		<section id="universe">
			{/* <a target="_blank" href="http://scratch.mit.edu/create">
				<button id="go-to-scratch" class="btn btn-success">Go to Scratch
				</button>
			</a> */}
			<div className="filter">
			    <div><input type='text' onChange={this.textFilterOnChange} placeholder="Search..."/></div>
			    <div><input type="checkbox" checked={classFilter} onClick={this.onClassFilterChange}/><label>Your Class Only</label>
				</div>
			   <div> {selectedFilters.length != Object.keys(CATEGORIES).length && (
					<select onChange={this.categoryFilterOnChange}>
						<option value="-1">Filter...</option>
				    	{Object.keys(CATEGORIES).filter(f=>!selectedFilters.includes(f)).map(filterName=><option value={filterName}>{filterName}</option>)}
				    </select>
			    )}</div>
			    
			    {selectedFilters.length > 0 && (
			    	<div className="filter-categories">
			    		{selectedFilters.map(f=>(
			    			<a onClick={()=>this.filterOnClick(f)}>{f}</a>
			    		))}
			    	</div>
			    )}	
				</div>	

			<div className="main">	
				{projects.filter(project=>
					project.Status === 'APPROVED' && 
					(filter.length === 0 || filter.filter(f=>Object.keys(project.Categories).includes(f)).length > 0) && 
					(project.Title.toLowerCase().includes(textFilter.toLowerCase()) || project.Author.DisplayName.toLowerCase().includes(textFilter.toLowerCase())) &&
					(!classFilter || classMembers.includes(project.Author.key)))
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
export default withFirebase(withAuthentication(Universe));