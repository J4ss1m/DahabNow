/**
 * Message.js
 * Represents a contact message sent from a guest to a seller on DahabNow.
 * Messages are stored in Firestore and visible to the recipient seller.
 */
export class Message {
  #messageId;
  #senderId;      // UID or "guest" if unauthenticated
  #senderName;    // Display name or "Anonymous"
  #recipientId;   // Seller UID who receives the message
  #shopId;        // Which shop the message relates to
  #content;       // Message body text
  #isRead;        // boolean — has the seller viewed this?
  #sentAt;        // Date

  /**
   * @param {string}  messageId   - Firestore document ID
   * @param {string}  senderId    - Sender's UID (or "guest")
   * @param {string}  senderName  - Sender's display name
   * @param {string}  recipientId - Seller's UID
   * @param {string}  shopId      - Related shop's Firestore ID
   * @param {string}  content     - Message body
   * @param {boolean} isRead      - Read state
   * @param {Date}    sentAt      - Send timestamp
   */
  constructor(
    messageId,
    senderId,
    senderName,
    recipientId,
    shopId,
    content,
    isRead = false,
    sentAt = new Date()
  ) {
    this.#messageId = messageId;
    this.#senderId = senderId;
    this.#senderName = senderName;
    this.#recipientId = recipientId;
    this.#shopId = shopId;
    this.#content = content;
    this.#isRead = isRead;
    this.#sentAt = sentAt;
  }

  // ─── Getters ────────────────────────────────────────────────
  getMessageId()   { return this.#messageId; }
  getSenderId()    { return this.#senderId; }
  getSenderName()  { return this.#senderName; }
  getRecipientId() { return this.#recipientId; }
  getShopId()      { return this.#shopId; }
  getContent()     { return this.#content; }
  getIsRead()      { return this.#isRead; }
  getSentAt()      { return this.#sentAt; }

  // ─── Methods ─────────────────────────────────────────────────

  /**
   * Mark the message as read in Firestore.
   */
  markAsRead() {
    this.#isRead = true;
    // Delegated to firebase/firestore.js
  }

  /**
   * Send the message to Firestore.
   */
  send() {
    // Delegated to firebase/firestore.js
  }

  /**
   * Return a plain object for Firestore writes.
   * @returns {Object}
   */
  toFirestoreObject() {
    return {
      messageId:   this.#messageId,
      senderId:    this.#senderId,
      senderName:  this.#senderName,
      recipientId: this.#recipientId,
      shopId:      this.#shopId,
      content:     this.#content,
      isRead:      this.#isRead,
      sentAt:      this.#sentAt,
    };
  }
}
