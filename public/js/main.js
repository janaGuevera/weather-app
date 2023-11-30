const addingLoader = ` <span class="spinner-border spinner-border-sm" 
                        role="status" aria-hidden="true"></span>
                        Loading...
                    `;

const generalLoader = ` <span class="spinner-border spinner-border-sm" 
                            role="status" aria-hidden="true"></span>
                        `;


const showSuccess = (data) => {
    toastr.success(data.msg);
};

const showError = (data) => {
    toastr.error(data.msg);
}

const showModal = (selector, option) => {
    $("label.error").hide();
    $(selector).modal("show");
}

const closeModal = (selector, option) => {
    $(selector).modal("hide");
}

const showLoader = (selector, content) => {
    $(selector).html(content);
    $(selector).prop("disabled", true);
}

const hideLoader = (selector, content) => {
    $(selector).html(content);
    $(selector).prop("disabled", false);
}