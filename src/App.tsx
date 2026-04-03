import React from 'react';
import {
  HashRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import Home from './Home';
import './App.scss'

// function PrivateRoute({ children, ...rest }: any) {
//   return (
//     <Route
//       {...rest}
//       render={({ location }) =>
//       common.timeDate.isBegin ? (
//           children
//         ) : (
//           <Redirect
//             to={{
//               pathname: "/",
//               state: { from: location }
//             }}
//           />
//         )
//       }
//     />
//   );
// }


function App() {
  return (
    <section className="hzfe-music">
      <Router>
        <Routes>
          <Route path="/*" element={<Home />} />
        </Routes>
      </Router>
    </section>
  );
}

export default App;
