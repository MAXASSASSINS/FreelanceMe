import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { StepProps, StepRef } from "../../Pages/CreateGig";
import { RootState } from "../../store";
import { IFile } from "../../types/file.types";
import { uploadToCloudinaryV2 } from "../../utility/cloudinary";
import { FileDropIcon, FileDropIconRef } from "../FileDropIcon";

const Step5 = ({ handleSendData }: StepProps, ref: React.Ref<StepRef>) => {
  const { gigDetail } = useSelector((state: RootState) => state.gigDetail);
  const [sellerShowcaseImages, setSellerShowcaseImages] = useState<
    (IFile | null)[]
  >([null, null, null]);
  const [sellerShowcaseVideo, setSellerShowcaseVideo] = useState<IFile | null>(
    null
  );
  const sellerShowcaseImagesRefs = useRef<React.RefObject<FileDropIconRef>[]>(
    Array.from({ length: 3 }, () => React.createRef<FileDropIconRef>())
  );

  const sellerShowcaseVideoRef = useRef<FileDropIconRef>(null);
  const [sellerShowcaseVideoError, setSellerShowcaseVideoError] = useState("");
  const [sellerShowcaseImagesError, setSellerShowcaseImagesError] =
    useState("");

  const checkForWarnings = () => {
    let foundOneImage = false;
    sellerShowcaseImages.forEach((item, index) => {
      if (item !== null) {
        foundOneImage = true;
      }
    });
    if (!foundOneImage) {
      setSellerShowcaseImagesError("Please upload at least one image");
      return true;
    }
    if (sellerShowcaseImagesError || sellerShowcaseVideoError) return true;
  };

  const handleSubmit = async () => {
    if (checkForWarnings()) {
      return false;
    }
    const images: IFile[] = [];
    sellerShowcaseImages.forEach((item, index) => {
      if (item) {
        images.push(item);
      }
    });
    const res1 = await uploadToCloudinaryV2(images);
    const res2 = await uploadToCloudinaryV2(
      sellerShowcaseVideo ? [sellerShowcaseVideo] : []
    );

    const media = {
      images: res1,
      video: res2[0] ? res2[0] : null,
    };

    setSellerShowcaseImages(res1);
    setSellerShowcaseVideo(res2[0]);
    const payload = { data: media, step: 5 };
    const res = await handleSendData(payload);
    return res || false;
  };

  const getSellerShowcaseVideo = (val: IFile) => {
    setSellerShowcaseVideoError("");
    setSellerShowcaseVideo(val);
  };

  const getSellerShowcaseImages = (val: IFile, index?: number) => {
    const newSellerShowcaseImages = sellerShowcaseImages.map((item, i) => {
      if (i === index) {
        return val;
      } else {
        return item;
      }
    });
    setSellerShowcaseImagesError("");
    setSellerShowcaseImages(newSellerShowcaseImages);
  };

  const getSellerShowcaseVideoError = (val: string) => {
    setSellerShowcaseVideoError(val);
  };

  const getSellerShowcaseImagesError = (val: string) => {
    setSellerShowcaseImagesError(val);
  };

  useEffect(() => {
    if (!gigDetail) return;
    const { images, video } = gigDetail;
    images?.forEach((item, index) => {
      sellerShowcaseImagesRefs.current[index].current?.setFileComingFromParent(
        item
      );
    });
    if (video) sellerShowcaseVideoRef.current?.setFileComingFromParent(video);

    let emptyImages = [];
    for (let i = 3 - (images?.length || 0); i > 0; i--) {
      emptyImages.push(null);
    }
    if (images) {
      setSellerShowcaseImages([...images, ...emptyImages]);
    } else {
      setSellerShowcaseImages(emptyImages);
    }
    if (video) setSellerShowcaseVideo(video);
  }, [gigDetail]);

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  return (
    <div>
      <div className="text-light_heading">
        <h3 className="text-2xl sm:text-3xl text-light_heading font-semibold mb-4">
          Showcase Your Services In A Gig Gallery
        </h3>
        <p className="text-light_heading">
          Encourage buyers to choose your Gig by featuring a variety of your
          work.
        </p>
        <div className="flex flex-col">
          <section className="border-b border-b-no_focus py-8">
            <h4 className="text-base sm:text-xl font-bold">Images(up to 3)</h4>
            <p className="text-[0.9rem] text-icons my-1">
              Get noticed by the right buyers with visual examples of your
              services.
            </p>
            <div className="mt-8 grid grid-cols-3 md:grid-cols-[repeat(3,15rem)] gap-4">
              {[1, 2, 3].map((num, index) => {
                return (
                  <FileDropIcon
                    key={index}
                    type="image"
                    fileAcceptType="image/*"
                    getSelectedFile={getSellerShowcaseImages}
                    index={index}
                    maxFileSize={5 * 1024 * 1024}
                    getError={getSellerShowcaseImagesError}
                    ref={sellerShowcaseImagesRefs.current[index]}
                  />
                );
              })}
            </div>
            {sellerShowcaseImagesError && (
              <p className="text-warning relative text-sm top-2">
                {sellerShowcaseImagesError}
              </p>
            )}
          </section>
          <section className="py-8">
            <h4 className="text-base sm:text-xl font-bold">Video (one only)</h4>
            <p className="text-[0.9rem] text-icons my-1">
              Capture buyers' attention with a video that showcases your
              service.
            </p>
            <p className="text-xs text-icons mt-2">
              Please choose a video shorter than 75 seconds and smaller than
              50MB
            </p>
            <div className="mt-8 grid grid-cols-3 sm:flex gap-4">
              <FileDropIcon
                fileAcceptType="video/*"
                type="video"
                getSelectedFile={getSellerShowcaseVideo}
                maxFileSize={50 * 1024 * 1024}
                getError={getSellerShowcaseVideoError}
                maxDuration={75}
                ref={sellerShowcaseVideoRef}
              />
            </div>
            {sellerShowcaseVideoError && (
              <p className="text-warning relative text-sm top-2">
                {sellerShowcaseVideoError}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default forwardRef(Step5);
