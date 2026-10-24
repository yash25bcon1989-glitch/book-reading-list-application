
"use strict";

// Store all books in an array.
let books = [];
let nextBookId = 1;

// Get the HTML elements used by the application.
const bookForm = document.getElementById("book-form");
const titleInput = document.getElementById("book-title");
const authorInput = document.getElementById("book-author");
const statusInput = document.getElementById("book-status");
const formMessage = document.getElementById("form-message");
const bookList = document.getElementById("book-list");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");

const totalBooksElement = document.getElementById("total-books");
const toReadElement = document.getElementById("to-read-count");
const readingElement = document.getElementById("reading-count");
const completedElement = document.getElementById("completed-count");
const libraryCountElement = document.getElementById("library-count");

// Convert status values into readable labels.
function getStatusLabel(status) {
  const labels = {
    "to-read": "Want to read",
    "reading": "Currently reading",
    "completed": "Completed"
  };

  return labels[status] || "Want to read";
}

// Create a small status badge for a book.
function createStatusBadge(status) {
  const badge = document.createElement("span");
  badge.className = `status-badge status-${status}`;
  badge.textContent = getStatusLabel(status);
  return badge;
}

// Update the summary counts at the top of the page.
function updateSummary() {
  totalBooksElement.textContent = books.length;

  toReadElement.textContent =
    books.filter(book => book.status === "to-read").length;

  readingElement.textContent =
    books.filter(book => book.status === "reading").length;

  completedElement.textContent =
    books.filter(book => book.status === "completed").length;

  libraryCountElement.textContent =
    `${books.length} ${books.length === 1 ? "book" : "books"}`;
}

// Display the books matching the current search and filter.
function renderBooks() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const visibleBooks = books.filter(book => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" || book.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  bookList.replaceChildren();

  visibleBooks.forEach(book => {
    const bookItem = document.createElement("article");
    bookItem.className = "book-item";

    const bookInfo = document.createElement("div");
    bookInfo.className = "book-info";

    const title = document.createElement("h3");
    title.className = "book-title";
    title.textContent = book.title;

    const author = document.createElement("p");
    author.className = "book-author";
    author.textContent = book.author || "Author not specified";

    bookInfo.append(title, author);

    const actions = document.createElement("div");
    actions.className = "book-actions";

    actions.appendChild(createStatusBadge(book.status));

    const statusSelect = document.createElement("select");
    statusSelect.className = "status-select";
    statusSelect.setAttribute(
      "aria-label",
      `Change reading status for ${book.title}`
    );

    const statuses = [
      ["to-read", "Want to read"],
      ["reading", "Currently reading"],
      ["completed", "Completed"]
    ];

    statuses.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      option.selected = book.status === value;
      statusSelect.appendChild(option);
    });

    statusSelect.addEventListener("change", () => {
      updateBookStatus(book.id, statusSelect.value);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute(
      "aria-label",
      `Delete ${book.title}`
    );

    deleteButton.addEventListener("click", () => {
      deleteBook(book.id);
    });

    actions.append(statusSelect, deleteButton);
    bookItem.append(bookInfo, actions);
    bookList.appendChild(bookItem);
  });

  // Show the empty message when no books match.
  emptyState.hidden = visibleBooks.length > 0;
  updateSummary();
}

// Add a new book after validating the input.
bookForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const status = statusInput.value;

  if (!title) {
    formMessage.textContent = "Please enter a book title.";
    titleInput.focus();
    return;
  }

  // Do not allow duplicate titles, ignoring letter case.
  const duplicateExists = books.some(
    book => book.title.toLowerCase() === title.toLowerCase()
  );

  if (duplicateExists) {
    formMessage.textContent = "This book is already in your list.";
    titleInput.focus();
    return;
  }

  // Keep the list manageable.
  if (books.length >= 100) {
    formMessage.textContent =
      "You can add up to 100 books. Delete a book to add another.";
    return;
  }

  books.push({
    id: nextBookId++,
    title,
    author,
    status
  });

  formMessage.textContent = "";
  bookForm.reset();

  // Show the new book even if a previous search was active.
  searchInput.value = "";
  statusFilter.value = "all";

  renderBooks();
  titleInput.focus();
});

// Change a book's reading status.
function updateBookStatus(bookId, newStatus) {
  const book = books.find(item => item.id === bookId);

  if (book) {
    book.status = newStatus;
    renderBooks();
  }
}

// Remove a book from the list.
function deleteBook(bookId) {
  books = books.filter(book => book.id !== bookId);
  renderBooks();
}

// Update the visible books as the user types or changes filters.
searchInput.addEventListener("input", renderBooks);
statusFilter.addEventListener("change", renderBooks);

// Show the initial empty library.
renderBooks();
