//
// This class handles user interaction on the client side for the door.

/** Constructor */
function DoorClient() {

}

/** Called on startup */
DoorClient.prototype.preload = function(id) {

    // Store our ID
    this.id = id
    print("[Door] Loaded...")

}

/** @private Called when the user presses on the door */
DoorClient.prototype.mousePressOnEntity = function(id, event) {

    // Ensure it's ours
    if (id != this.id)
        return

    // Ignore if it wasn't the primary button
    if (!event || !event.isPrimaryButton)
        return

    // Send open event to server
    print("[Door] Sending toggle event to server...")
    Entities.callEntityServerMethod(this.id, "requestToggle", [])

}


// Return our class (nasty)
;(DoorClient)
