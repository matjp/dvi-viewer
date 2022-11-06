import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function LogItem(props) {
    return <div>{props.value}</div>;
  }

export default function ModalLog(props) {
    const [logShow, setLogShow] = useState(false);
  
    const handleLogShow = () => setLogShow(true);  
    const handleLogClose = () => setLogShow(false);
  
    return (
      <>
        <Button variant="primary" onClick={handleLogShow}>
          Show Log
        </Button>    
  
        <Modal size="lg" backdrop="static" show={logShow} onHide={handleLogClose}>
          <Modal.Header closeButton>
            <Modal.Title>Log Messages</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {props.logs.map((log, index) => <LogItem key={index} value={log}/>)}
          </Modal.Body>
        </Modal>
      </>
    );
  }
  