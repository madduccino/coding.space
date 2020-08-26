import React from 'react';
import { Link } from 'react-router-dom';
import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';
import { AuthUserContext, withAuthentication } from '../Session';
import LazyImage from '../LazyImage';
import logo from './logo.png'

class Navigation extends React.Component{
  constructor(props){
    super(props);
    this.state={

    }
  }
  render(){
    const {authUser} = this.props;
    const {pathname} = this.props.location;
    if(authUser)
      return (
        <>
        <Link className="logo" to={ROUTES.LANDING}><img src={logo} /></Link>
        <div className="nav">
            <Link to={ROUTES.UNIVERSE}>Universe</Link>
            <Link to={ROUTES.NEW_PROJECT}>New Untutorial</Link>
            <Link to={ROUTES.CLASSES}>My Classes</Link>       
            <Link to={ROUTES.JETFUEL}>Jet Fuel</Link>   
            <Link to={ROUTES.SIMULATOR}>Simulator</Link>   
            {!!authUser.roles[ROLES.ADMIN] && (
                <Link to={ROUTES.NEW_USER}>New User</Link>            
              )}
            {!!authUser.roles[ROLES.TEACHER] && (
              <Link to={ROUTES.PROGRESSREVIEWS}>Student Progress</Link>
            )}
            {!!authUser&&(
            <div className="dropdown">
              <div id="menu" className={this.props.showNav ? "highlight" : null}> 
                {!!authUser.ThumbnailFilename && authUser.ThumbnailFilename != '' ? (
                  <LazyImage file={this.props.firebase.storage.ref('/public/' + authUser.key + '/' + authUser.ThumbnailFilename)}/>
                ) : (
                  <LazyImage file={this.props.firebase.storage.ref('/public/astronaut.png')}/>
                )}
                <div>{authUser.Username}</div>
            </div>
          </div>
            )} 
          <div className={this.props.showNav ? "showMenu" : "hideMenu"}> 
            <Link to={'/profile/' + authUser.uid}>My Profile</Link>
            {(!!authUser.roles[ROLES.ADMIN] || !!authUser.roles[ROLES.TEACHER]) && (
              <Link to={ROUTES.RESOURCE_HOME}>Resources</Link>
            )}
            <Link to={'/launchpad'}>Launch Pad</Link>
            <SignOutButton />
          </div>
       
        </div>
        </>
      )
    return (
      <>

      <Link className="logo" to={ROUTES.LANDING}><img src={logo} /></Link>
      <div className="nav">
          {pathname != '/signin' && (
          <Link to={ROUTES.SIGN_IN}><span className="signIn">Sign In</span></Link>
          )}
        </div>
        </>
      )
  }
}




export default withAuthentication(Navigation);