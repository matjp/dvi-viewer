import Form from 'react-bootstrap/Form';

export default function SelectFileButton(props) {
    const handleChange = (e) => {
      props.fileEvent(e.target.files[0]);
    };
  
    return (
      <div className='mt-5' >
        <Form.Label>{props.selectMsg}</Form.Label>
        <Form.Control type="file" accept=".dvi" onChange={handleChange}></Form.Control>
      </div>
    );
  }
  