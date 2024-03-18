import { faCancel, faClose, faCross } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState, useSyncExternalStore } from "react";
import { Nav, Navbar } from "react-bootstrap";
import { useSessionStorage } from 'usehooks-ts'

import "./TabsComponent.css"
import { notebookStoreContext, persistenceContext } from "../../stores/context";

export default function TabsComponent() {
    const notebooksContext = useContext(notebookStoreContext)
    const selectedNotebook = useSyncExternalStore(notebooksContext.subscribeSelected.bind(notebooksContext),notebooksContext.getSelectedName.bind(notebookStoreContext));

    function handleSelectNotebook(name: string){
        notebooksContext.changeNotebook(name);
    }

    function handleCloseNotebook(name: string){
        notebooksContext.deleteNotebook(name);    
    }

    function handleRenameNotebook(name: string, event: React.FormEvent<HTMLInputElement>){
        const newText = event.currentTarget.value; 
        if(!newText) return;
        
        notebooksContext.renameNotebook(name,newText);
    }

    const tabStyle = {
        display: "inline", 
        paddingRight: "0.1vw",
        paddingBottom: "0.1vw",
    }

    // border: 0;
    // border-style: solid;

    return <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="mr-auto">
        {Array.from(notebooksContext.stores.keys()).map( Name => {
            const name = `${Name}`;
            return  <Nav.Link key={name} style={{cursor: "default"}}>
            <div style={tabStyle} onClick={() => handleSelectNotebook(name)}>
                {
                    name === selectedNotebook ? 
                    <input type="text" className="tabText"
                    style={{
                        border: 0,
                        borderBottom: "0.1vw", 
                        borderStyle: "solid"}}
                    value={name}
                    minLength={1}
                    onChange={(e) => handleRenameNotebook(name, e)}/> 
                    :
                    <input type="text" className="tabText"
                    style={{
                        border: 0,
                        borderBottom: 0
                    }}
                    minLength={1}
                    value={name}
                    onChange={(e) => handleRenameNotebook(name, e)}/> 
                }
            </div>
            <FontAwesomeIcon icon={faClose} onClick={() => handleCloseNotebook(name)}/>
            </Nav.Link>
            }
        )}
    </Nav>
</Navbar.Collapse>
}