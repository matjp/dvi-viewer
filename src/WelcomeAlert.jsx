import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';

export default function WelcomeAlert(props) {
    const [show, setShow] = useState(true);
    if (show) {
      return (
        <Alert show={show} variant="info" dismissible onClose={ () => setShow(false)}>
        <p>
          The file 'intro.dvi' was loaded as an example. Download the LaTeX source: <Alert.Link href="./intro.tex">intro.tex.</Alert.Link>
          The image files were converted from EPS to SVG and were uploaded to this server.
        </p>
        </Alert>
      );
    }
  }
  