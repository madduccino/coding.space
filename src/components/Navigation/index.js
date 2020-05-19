import React from 'react';
import { Link } from 'react-router-dom';
import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';
import { AuthUserContext, withAuthentication } from '../Session';
import LazyImage from '../LazyImage';

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
        <div>
          <ul>
            <li>
              <Link to={ROUTES.LANDING}>Home</Link>
            </li>
            <li>
              <Link to={ROUTES.NEW_PROJECT}>Create a Project!</Link>
            </li>
            <li>
              <Link to={'/profile/' + authUser.uid}>Account</Link>
            </li>

            
            {(!!authUser.roles[ROLES.ADMIN] || !!authUser.roles[ROLES.TEACHER]) && (
              <li>
                <Link to={ROUTES.CLASSES}>Classes</Link>
              </li>

              )}
            {!!authUser.roles[ROLES.ADMIN] && (
              
              <li>
                <Link to={ROUTES.NEW_USER}>New User</Link>
              </li>
            )}
            <li>
              <SignOutButton />
            </li>
          </ul>
          {!!authUser&&!!authUser.ThumbnailFilename &&(
            <LazyImage file={this.props.firebase.storage.ref('/public/' + authUser.key + '/' + authUser.ThumbnailFilename)}/>
          )}
          
        </div>


      )
    return (

        <ul>
        
          <li>
            <Link to={ROUTES.LANDING}>Landing</Link>
          </li>
          
          {pathname != '/signin' && (
            <li>
              <Link to={ROUTES.SIGN_IN}>Sign In</Link>
            </li>
          )}

        </ul>


      )
  }
}




export default withAuthentication(Navigation);