function getStyles() {
  return `
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f5f5f7;
        padding: 2rem;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      h1 {
        font-size: 1.8rem;
        color: #1d1d1f;
        margin-bottom: 2rem;
        text-align: center;
      }

      .rule-line {
        display: grid;
        grid-template-columns: repeat(4, 1fr) auto;
        gap: 1rem;
        margin-bottom: 1rem;
        align-items: start;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #1d1d1f;
      }

      input, select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d2d2d7;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s ease;
      }

      input:focus, select:focus {
        outline: none;
        border-color: #0071e3;
        box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.1);
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .btn-primary {
        background-color: #0071e3;
        color: white;
      }

      .btn-secondary {
        background-color: #f5f5f7;
        color: #1d1d1f;
      }

      .btn-add {
        padding: 0.5rem;
        background-color: #34c759;
        color: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        line-height: 1;
      }

      .verification-results {
        margin-top: 2rem;
        padding: 1rem;
        background-color: #f5f5f7;
        border-radius: 8px;
      }

      .error {
        color: #ff3b30;
        margin-top: 0.5rem;
      }

      .notification {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 2rem;
        border-radius: 8px;
        background-color: #34c759;
        color: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transform: translateY(150%);
        transition: transform 0.3s ease;
      }

      .notification.show {
        transform: translateY(0);
      }

      .notification.error {
        background-color: #ff3b30;
      }

      .hidden {
        display: none;
      }

      @media (max-width: 768px) {
        .rule-line {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
}
