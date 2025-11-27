
let editBtns = document.querySelectorAll(".edit-btns");

for (let editBtn of editBtns) {
  editBtn.addEventListener("click", (e) => {
    const clickedSpan = e.target;

    if (clickedSpan.classList.contains("edit")) {
      // Handle Edit click
      const cancel = editBtn.querySelector(".cancel");
      clickedSpan.classList.add("hide");
      cancel.classList.remove("hide");

      const editForm = editBtn.parentElement.nextElementSibling;
      const h6Data = editBtn.parentElement.previousElementSibling?.children[1];
      const h6Label = editBtn.parentElement.previousElementSibling?.children[0];

      if (editForm) editForm.classList.remove("hide");
      if (h6Data) h6Data.classList.add("hide");
      if (h6Label) h6Label.classList.remove("pointer-none");

      // Disable other edits
      document.querySelectorAll(".edit").forEach(btn => btn.classList.add("pointer-none"));
      document.querySelectorAll(".info .h6-lable").forEach(label => label.classList.add("pointer-none"));
      

    } else if (clickedSpan.classList.contains("cancel")) {
      // Handle Cancel click
      const edit = editBtn.querySelector(".edit");
      clickedSpan.classList.add("hide");
      edit.classList.remove("hide");

      const editForm = editBtn.parentElement.nextElementSibling;
      const h6Data = editBtn.parentElement.previousElementSibling?.children[1];
      if (editForm) {
        // Clear form inputs
        editForm.querySelectorAll("input").forEach(input => input.value = "");
        const select = editForm.querySelector("select");
        if (select) {
          select.value = "";
        }
        editForm.classList.add("hide");
      }

      if (h6Data) h6Data.classList.remove("hide");

      // Re-enable all other edits
      document.querySelectorAll(".edit").forEach(btn => btn.classList.remove("pointer-none"));
      document.querySelectorAll(".info .h6-lable").forEach(label => label.classList.remove("pointer-none"));
    }
  });
}

// document.querySelectorAll(".edit-btns").forEach((editBtn) => {
//     editBtn.addEventListener("click", (e) => {
//       const clickedBtn = e.target;
  
//       // Ignore clicks on disabled buttons
//       if (clickedBtn.classList.contains("pointer-none")) return;
  
//       if (clickedBtn.innerText !== "Edit" && clickedBtn.innerText !== "Cancel" && clickedBtn.innerText !== "Update") {
//         return; // ignore other clicks inside .edit-btns
//       }
  
//       // .edit-btns div
//       const editBtnsDiv = clickedBtn.closest(".edit-btns");
//       if (!editBtnsDiv) return;
  
//       // .info div is parent of .edit-btns
//       const infoDiv = editBtnsDiv.parentElement;
//       if (!infoDiv) return;
  
//       // .details-and-form is parent of .info and .edit-form
//       const detailsDiv = infoDiv.parentElement;
//       if (!detailsDiv) return;
  
//       // Find the h6 labels inside infoDiv
//       const h6Lable = infoDiv.querySelector(".h6-lable");
//       const h6Data = infoDiv.querySelector(".h6-data");
  
//       // The form container is sibling of .info
//       const editForm = detailsDiv.querySelector(".edit-form");
//       if (!h6Lable || !h6Data || !editForm) return;
  
//       const editSpan = editBtnsDiv.querySelector(".edit");
//       const cancelSpan = editBtnsDiv.querySelector(".cancel");
  
//       if (clickedBtn.innerText === "Edit" || clickedBtn.innerText === "Update") {
//         // Show form and cancel button, hide edit button and data
//         editSpan.classList.add("hide");
//         cancelSpan.classList.remove("hide");
//         editForm.classList.remove("hide");
//         h6Data.classList.add("hide");
  
//         // Disable other edit buttons
//         document.querySelectorAll(".edit-btns .edit").forEach((btn) => {
//           if (btn !== editSpan) btn.classList.add("pointer-none");
//         });
  
//         // Disable other labels except current
//         document.querySelectorAll(".info .h6-lable").forEach((label) => {
//           if (label !== h6Lable) label.classList.add("pointer-none");
//           else label.classList.remove("pointer-none");
//         });
  
//       } else if (clickedBtn.innerText === "Cancel") {
//         // Hide form, show edit button and data, hide cancel
//         cancelSpan.classList.add("hide");
//         editSpan.classList.remove("hide");
  
//         // Clear inputs in the form
//         editForm.querySelectorAll("input").forEach((input) => (input.value = ""));
//         const select = editForm.querySelector("select");
//         if (select) {
//           select.value = "";
//           select.addEventListener("change", () => {
//             if (!select.value) {
//               select.value = select[0].innerText;
//               select[0].selected = true;
//             }
//           });
//         }
  
//         editForm.classList.add("hide");
//         h6Data.classList.remove("hide");
  
//         // Enable all edit buttons and labels again
//         document.querySelectorAll(".edit-btns .edit").forEach((btn) => btn.classList.remove("pointer-none"));
//         document.querySelectorAll(".info .h6-lable").forEach((label) => label.classList.remove("pointer-none"));
//       }
//     });
// });
  