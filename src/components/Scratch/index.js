import React from 'react';
import './index.css';

import LazyImage from '../LazyImage';

import { withAuthentication } from '../Session';
import { withFirebase } from '../Firebase';


class Scratch extends React.Component {
 constructor(props){
 	super(props);
 	this.state = {
 		loading:false,
 		projects: [],
 	}
 	//console.log("hiya");

 }
 
 handleMouseEnter = () => this.props.setGlobalState({showFooter:false});
	/*$('#scratch-box').fadeIn(250);
	$('#footer').css('display','none');*/
 handleMouseLeave = () => this.props.setGlobalState({showFooter:true})
 componentDidMount(){
 	this.setState({ loading: true });

 	this.props.firebase.projects().on('value', snapshot => {
 		const projectsObj = snapshot.val();
 		const projects = Object.keys(projectsObj).map(key =>({
 			...projectsObj[key],
 			pid:key,
 		}))
 		this.setState({
 			projects: projects,
 			loading:false,
 		})
 	})
 }
 componentWillUnmount(){
 	this.props.firebase.projects().off();
 }
 render(){
 	
 	const {projects, loading} = this.state;


 	//console.log("hiya")
 	return (
		<div>
			<div style={{padding:30 + 'px',marginLeft:0 + 'px',marginRight:0 + 'px',textAlign:'center'}}>
			   <h1>Scratch Projects</h1>
			</div>
			<a target="_blank" href="http://scratch.mit.edu/create">
				<button id="go-to-scratch" class="btn btn-success">
					Go to Scratch
				</button>
			</a>
			
			<div id="level1" class="level-container">

			   <h2>Level 1</h2>
			   <div class="level">
				    {loading && <div>Loading ...</div>}
					{projects.filter(project=>project.Level == 1).map(project => (
						
						<div id={project.key} class={'wsite-image wsite-image-border-none project'}>
							<a href={'/project/' + project.key} path={'/public/' + project.Author + '/' + project.ThumbnailFilename}>
								<LazyImage file={this.props.firebase.storage.ref('/public/' + project.Author + '/' + project.ThumbnailFilename)}/>
							</a>
							<div>
								<h4>{project.Title}</h4>
							</div>
						</div>
					))}
			   </div>
			</div>
			<div class="circle-break"></div>
			<div class="circle-break"></div>
			<div class="circle-break"></div>
			<div id="level2" class="level-container">
			   <h2>Level 2</h2>
			   <div class="level">
			      {loading && <div>Loading ...</div>}
					{projects.filter(project=>project.Level == 2).map(project => (
						
						<div id={project.key} class={'wsite-image wsite-image-border-none project'}>
							<a href={'/project/' + project.key} path={'/public/' + project.Author + '/' + project.ThumbnailFilename}>
								<LazyImage file={this.props.firebase.storage.ref('/public/' + project.Author + '/' + project.ThumbnailFilename)}/>
							</a>
							<div>
								<h4>{project.Title}</h4>
							</div>
						</div>
					))}
			   </div>
			</div>
			<div class="circle-break"></div>
			<div class="circle-break"></div>
			<div class="circle-break"></div>
			<div id="level3" class="level-container">
			   <h2>Level 3</h2>
			   <div class="level">
			      {loading && <div>Loading ...</div>}
					{projects.filter(project=>project.Level == 3).map(project => (
						
						<div id={project.key} class={'wsite-image wsite-image-border-none project'}>
							<a href={'/project/' + project.key} path={'/public/' + project.Author + '/' + project.ThumbnailFilename}>
								<LazyImage file={this.props.firebase.storage.ref('/public/' + project.Author + '/' + project.ThumbnailFilename)}/>
							</a>
							<div>
								<h4>{project.Title}</h4>
							</div>
						</div>
					))}
		      </div>

			</div>
			<div class="circle-break"></div>
			<div class="circle-break"></div>
			<div class="circle-break"></div>
			<div id="level4" class="level-container">
			   <h2>Level 4</h2>
			   <div class="level">
			      {loading && <div>Loading ...</div>}
					{projects.filter(project=>project.Level == 4).map(project => (
						
						<div id={project.key} class={'wsite-image wsite-image-border-none project'}>
							<a href={'/project/' + project.key} path={'/public/' + project.Author + '/' + project.ThumbnailFilename}>
								<LazyImage file={this.props.firebase.storage.ref('/public/' + project.Author + '/' + project.ThumbnailFilename)}/>
							</a>
							<div>
								<h4>{project.Title}</h4>
							</div>
						</div>
					))}
		      </div>

			</div>
			<div class="circle-break"></div>
			<div class="circle-break"></div>
			<div class="circle-break"></div>
			<div id="level5" class="level-container">
			   <h2>Level 5</h2>
			   <div class="level">
			    
			       {loading && <div>Loading ...</div>}
					{projects.filter(project=>project.Level == 5).map(project => (
						
						<div id={project.key} class={'wsite-image wsite-image-border-none project'}>
							<a href={'/project/' + project.key} path={'/public/' + project.Author + '/' + project.ThumbnailFilename}>
								<LazyImage file={this.props.firebase.storage.ref('/public/' + project.Author + '/' + project.ThumbnailFilename)}/>
							</a>
							<div>
								<h4>{project.Title}</h4>
							</div>
						</div>
					))}
				</div>

				<div class="circle-break"></div>
				<div class="circle-break"></div>
				<div class="circle-break"></div>
				<div id="level6" class="level-container">
				   <h2>Level 6</h2>
				   <div class="level">
			         {loading && <div>Loading ...</div>}
					{projects.filter(project=>project.Level == 6).map(project => (
						
						<div id={project.key} class={'wsite-image wsite-image-border-none project'}>
							<a href={'/project/' + project.key} path={'/public/' + project.Author + '/' + project.ThumbnailFilename}>
								<LazyImage file={this.props.firebase.storage.ref('/public/' + project.Author + '/' + project.ThumbnailFilename)}/>
							</a>
							<div>
								<h4>{project.Title}</h4>
							</div>
						</div>
					))}

			   </div>
			</div>
		</div>
		</div>

	)
}
}
export default withFirebase(Scratch);