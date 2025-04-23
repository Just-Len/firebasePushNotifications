import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, IonTabs, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

import Login from "./pages/security/login";

import { useAuth } from "./contexts/authContext";
import { MenuLoggedIn } from "./components/Menu/private";
import { MenuLoggedOut } from "./components/Menu/public";
import Home from "./pages/Home";

import Tab3 from "./pages/Tab3";
import Perfil from "./pages/Perfil";

setupIonicReact();

const App: React.FC = () => {
  const { user } = useAuth(); 

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path='/home'>
              <Home />
            </Route>
            <Route exact path='/tab2'>
              <Perfil />
            </Route>
            <Route path='/tab3'>
              <Tab3 />
            </Route>
            <Route exact path='/'>
              <Redirect to='/home' />
            </Route>
            <Route exact path='/login'>
              <Login />
            </Route>
          </IonRouterOutlet>
          {user ? <MenuLoggedIn /> : <MenuLoggedOut />}
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
