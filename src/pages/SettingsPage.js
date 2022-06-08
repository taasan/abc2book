import { Link  } from 'react-router-dom'
import {Button} from 'react-bootstrap'
import {useState} from 'react'
import ShareTunebookModal from '../components/ShareTunebookModal'
export default function SettingsPage(props) {
  const tunebook = props.tunebook
  const token = props.token
  var linkBase = window.location.origin 
  linkBase = 'https://tunebook.syntithenai.com'
  const googleDocumentId = props.googleDocumentId
  const [link,setLink] = useState(null)
    return <div className="App-settings">
    <h1>Settings</h1>
   
       <Button style={{marginRight:'0.5em',marginBottom:'1em',  position:'relative', top:'2px'}}  variant="warning" onClick={tunebook.utils.resetAudioCache} >Clear Audio Cache</Button><br/>

       <ShareTunebookModal tunebook ={tunebook} token={token} googleDocumentId={googleDocumentId} />
   
    </div>
}