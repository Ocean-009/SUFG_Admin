import { SvgIcon, SvgIconProps } from '@mui/material';

const Store = (props: SvgIconProps) => {
  return (
    <SvgIcon width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-shop"
        viewBox="0 0 16 16"
      >
        <path d="M2.97 1.5a1 1 0 0 0-.91.594L.165 6.634a.5.5 0 0 0 .465.707H1v7.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V7.34h.37a.5.5 0 0 0 .465-.707L13.94 2.094a1 1 0 0 0-.91-.594H2.97zm.342 1h9.376l1.528 3.5H1.784L3.312 2.5zM2 7.34v7.16h12V7.34H2z" />
        <path d="M5 10h2v4H5v-4zm4 0h2v4H9v-4z" />
      </svg>
    </SvgIcon>
  );
};

export default Store;
