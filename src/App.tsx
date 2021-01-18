import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
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
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="*" exact>
            <Home />
          </Route>
        </Switch>
      </Router>
    </section>
  );
}

export default App;
