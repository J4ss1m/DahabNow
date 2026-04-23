/**
 * Notification.js
 * Represents a platform notification for sellers and admins on DahabNow.
 * Used for: approval/rejection alerts, admin broadcasts, system messages.
 */
export class Notification {
  #notificationId;
  #recipientId;   // UID of the user who receives this notification
  #title;
  #message;
  #isRead;        // boolean — has the recipient viewed it?
  #createdAt;     // Date
  #type;          // "approval" | "rejection" | "broadcast" | "system"

  /**
   * @param {string}  notificationId - Firestore document ID
   * @param {string}  recipientId    - UID of the target user
   * @param {string}  title          - Short notification title
   * @param {string}  message        - Full notification body
   * @param {string}  type           - Notification category
   * @param {boolean} isRead         - Read status
   * @param {Date}    createdAt      - Creation timestamp
   */
  constructor(
    notificationId,
    recipientId,
    title,
    message,
    type = "system",
    isRead = false,
    createdAt = new Date()
  ) {
    this.#notificationId = notificationId;
    this.#recipientId = recipientId;
    this.#title = title;
    this.#message = message;
    this.#type = type;
    this.#isRead = isRead;
    this.#createdAt = createdAt;
  }

  // ─── Getters ────────────────────────────────────────────────
  getNotificationId() { return this.#notificationId; }
  getRecipientId()    { return this.#recipientId; }
  getTitle()          { return this.#title; }
  getMessage()        { return this.#message; }
  getType()           { return this.#type; }
  getIsRead()         { return this.#isRead; }
  getCreatedAt()      { return this.#createdAt; }

  // ─── Methods ─────────────────────────────────────────────────

  /**
   * Mark this notification as read in Firestore.
   */
  markAsRead() {
    this.#isRead = true;
    // Delegated to firebase/firestore.js
  }

  /**
   * Return a plain object representation for Firestore writes.
   * @returns {Object}
   */
  toFirestoreObject() {
    return {
      notificationId: this.#notificationId,
      recipientId:    this.#recipientId,
      title:          this.#title,
      message:        this.#message,
      type:           this.#type,
      isRead:         this.#isRead,
      createdAt:      this.#createdAt,
    };
  }
}
