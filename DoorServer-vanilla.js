//
// This class handles opening and closing the door, server-side
//
// Man, I can't wait until HF gets ES6 support, this code is ugly without classes... Qt 5.12 with full ES6 support
// should be dropping around November 2018!


// The number of frames in the door animation
var ANIMATION_FRAMES = 29

// Speed of changing frames, per animation loop (which runs at 60FPS)
var ANIMATION_SPEED = 0.35

// Maximum amount of time the door stays open
var CLOSE_DELAY = 1000 * 30

/** Constructor */
function DoorServer() {

    // Specify which functions can be called remotely
    this.remotelyCallable = ["requestToggle"]

}

/** Called on startup */
DoorServer.prototype.preload = function(id) {

    // Store our ID
    this.id = id

    // Ensure door is closed
    this.isOpen = false
    this.currentFrame = 0
    Entities.editEntity(this.id, {
        collisionless: false,
        animation: {
            currentFrame: 0
        }
    })

    // Load sounds
    this.sounds = {}
    this.sounds["fail"] = SoundCache.getSound(Script.resolvePath("doorfail.mp3"))
    this.sounds["close"] = SoundCache.getSound(Script.resolvePath("doorclose.mp3"))

    print("[Door] Loaded...")

}

/** Called on shutdown */
DoorServer.prototype.unload = function() {

    // Remove close timer
    if (this.closeTimer) Script.clearTimeout(this.closeTimer)
    this.closeTimer = null

    // Stop existing animation, if any
    if (this.animationTimer) Script.clearInterval(this.animationTimer)
    this.animationTimer = null

    print("[Door] Unloaded")

}

/** @private Called by a client script when a user is requesting to toggle the door */
DoorServer.prototype.requestToggle = function() {

    // Check what to do
    if (this.isOpen)
        this.closeDoor()
    else
        this.openDoor()

}

/** Called to open the door */
DoorServer.prototype.openDoor = function() {

    // Set open
    this.isOpen = true
    Entities.editEntity(this.id, {
        collisionless: true
    })

    // Animate to target frame
    this.animateToFrame(ANIMATION_FRAMES)

    // Close soon
    if (this.closeTimer) Script.clearTimeout(this.closeTimer)
    this.closeTimer = Script.setTimeout(function() {
        this.closeDoor()
    }.bind(this), CLOSE_DELAY)

    // Play sound
    this.playSound("close")

}

/** Called to close the door */
DoorServer.prototype.closeDoor = function() {

    // Set open
    this.isOpen = false
    Entities.editEntity(this.id, {
        collisionless: false
    })

    // Animate to target frame
    this.animateToFrame(0)

    // Remove close timer
    if (this.closeTimer) Script.clearTimeout(this.closeTimer)
    this.closeTimer = null

    // Play sound
    this.playSound("close")

}

/** Runs the animation until the specified frame */
DoorServer.prototype.animateToFrame = function(targetFrame) {

    // Stop existing animation, if any
    if (this.animationTimer)
        Script.clearInterval(this.animationTimer)

    // Start timer, 60 FPS
    this.animationTimer = Script.setInterval(function() {

        // Check if up or down
        if (Math.abs(targetFrame - this.currentFrame) <= ANIMATION_SPEED) {

            // Target reached, set final frame
            this.currentFrame = targetFrame

            // Stop loop
            Script.clearInterval(this.animationTimer)
            this.animationTimer = null

        } else if (targetFrame > this.currentFrame) {

            // Increase frame
            this.currentFrame += ANIMATION_SPEED

        } else if (targetFrame < this.currentFrame) {

            // Increase frame
            this.currentFrame -= ANIMATION_SPEED

        }

        // Update entity's frame index
        Entities.editEntity(this.id, {
            animation: {
                currentFrame: this.currentFrame
            }
        })

    }.bind(this), 1000 / 60)

}

/** Plays a named sound */
DoorServer.prototype.playSound = function(name) {

    // Check if sound exists
    if (!this.sounds[name])
        return print("[Door] Sound " + name + " doesn't exist!")

    // Check if loaded
    if (!this.sounds[name].downloaded)
        return print("[Door] Can't play sound " + name + ", not loaded.")

    // Get our position
    var position = Entities.getEntityProperties(this.id, ["position"]).position

    // Play it
    Audio.playSound(this.sounds[name], {
        position: position
    })

}


// Return our class (nasty)
;(DoorServer)
