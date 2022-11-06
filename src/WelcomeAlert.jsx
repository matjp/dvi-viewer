import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';

export default function WelcomeAlert(props) {
    const [show, setShow] = useState(true);
    if (show) {
      return (
        <Alert show={show} variant="info" dismissible onClose={ () => setShow(false)}>
        <p>
          The file 'align.dvi' was loaded as an example. Download the LaTeX source: <Alert.Link href="./align.tex">align.tex</Alert.Link>
        </p>
        </Alert>
      );
    }
  }
  