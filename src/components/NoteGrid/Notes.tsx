import { useSelector } from "react-redux";
import NoteComponent from "./NoteComponent";
import { selectAllNotes } from "../../store/selectors";

export default function Notes() {
    const notesData = useSelector(selectAllNotes);

    const notes = notesData.map((note) => (
        <NoteComponent key={note.id} note={note} />
    ));

    return <>{notes}</>;
}
