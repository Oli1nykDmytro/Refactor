import React from "react";
import { ReactComponent as FileIcon } from "../icons/fileIcon.svg";
import ChipsInput from "./ChipsInput";

export const ChipsInput = ({
  files: files,
  setCurrentAttachmentIndex: setCurrentAttachmentIndex,
  setPreviewOpen: setPreviewOpen,
}): React.FC => {
  const handleChipClick = (attachmentIndex: number) => {
    setCurrentAttachmentIndex(attachmentIndex);
    setPreviewOpen(true);
  };

  return (
    <>
      <ChipsInput
        isLineType
        type="files"
        label="Attached File:"
        borderType="square"
        onClick={handleChipClick}
        value={files.map((attachment) => attachment?.name || "") || []}
        icon={<FileIcon width={13} height={13} />}
        onDeleteChip={(index) =>
          setFiles([...files.slice(0, index), ...files.slice(index + 1)])
        }
      />
    </>
  );
};
