from skimage.segmentation import slic as skl
from skimage import io
import os
import numpy as np
from PIL import Image
import json
import scipy.io as sio
import copy
import csv
import shutil

IMAGE_PATH = './images'
#IMAGE_PATH = './images/ILSVRC2012_img_val'
INIT_CONTENT_SQL = 'USE AuthenticationDB;\n'

# import groundtruth.txt as array
ground_truth = open('./ILSVRC2012_validation_ground_truth.txt', 'r').read().split('\n')

# import syn... from meta.mat
meta_mat = sio.loadmat('./meta.mat')['synsets']

# helper object for dynamic search for class labels in findParentClasses()
visited_nodes = dict()

# runction to find class labels
def findParentClasses(node, currentId):
    children = node['children'][0][0]
    nodeId = node['ILSVRC2012_ID'][0][0][0]
    if (nodeId in visited_nodes.keys()):
        return visited_nodes[nodeId]
    if (currentId in children):
        visited_nodes[nodeId] = True
        return True
    for child in children:
        if(findParentClasses(meta_mat[child-1], currentId) == True):
            return True
    visited_nodes[nodeId] = False
    return False    

#for file in sorted(os.listdir(IMAGE_PATH)):    
images_csv = open('./synonyms.csv')
images_reader = csv.reader(images_csv, delimiter=',', quotechar='"')
images_list = []
images_dict = {}
for row in images_reader:
    images_list.append(row[0])
    # print(row[0])
    # print(row[1])
    images_dict[row[0]] = row[1].replace('"', '').replace(' ', '').split(',')

# for file in images_list[1:]:
for file in os.listdir(IMAGE_PATH):
    file = file.replace('.JPEG', '')
    print(file + ' starting')
    
    # loads image as np.ndarray, shape: height x width x 3
    img = io.imread(IMAGE_PATH + '/' + file + '.JPEG')
    img1 = None
    img2 = None
    
    print(len(img.shape))
    
    if(len(img.shape)<3):
        img1 = np.array(img, copy=True)
        img2 = np.array(img, copy=True)
    
    # segments image, outputs 2d array - integer mask indicaing label
    segments = skl(img, n_segments=50, compactness=30, sigma=3)

    # get dimensions of image
    dim = (segments.shape[0], segments.shape[1])
    
    # retrieving the amount of segments for the current image (as it might differ from 50)
    numberOfSegments = 0
    
    for row in segments:
        for column in row:
            numberOfSegments = max(column.max(), numberOfSegments)
    
    print(numberOfSegments)
    # creating directory for segments per image
    if not os.path.exists('./segments/' + file):
        os.makedirs('./segments/' + file)

    # moves image to new folder
    shutil.copyfile(IMAGE_PATH + '/' + file + '.JPEG', './segments/' + file + '/' + file + '.JPEG')
    # writes segment array to file
    
    np.savetxt('./segments/' + file + '/' + file + '.txt', segments, fmt='%i')

    # retrieves all labels and class labels for the image and writes image properties to json 
    currentObject = meta_mat[int(ground_truth[int(file[-8:])-1])-1]
    
    label = dict()
    label2 = list()
    for word in currentObject['words'][0][0].split(', '):
        label[word] = int(currentObject['wordnet_height'][0][0][0])
    
    visited_nodes = dict()
    
    print('######### START ##########')
    for i in range(1000, meta_mat.size):
        currentParent = meta_mat[i]
        if (findParentClasses(currentParent, currentObject['ILSVRC2012_ID'][0][0][0]) == True):
            for word in currentParent['words'][0][0].split(', '):
                label[word] = int(currentParent['wordnet_height'][0][0][0])
    
    for key, value in label.items():
        label2.append({'label': key, 'wordnet height': value})
        
    print(label)
    print(label2)
    
    jsoutput = {
        'dimensions': {
        	'height': dim[0],
        	'width': dim[1],
            'label': label2,
            'annotation': currentObject['gloss'][0][0],
            'synonyms': images_dict[file]
        }
    }
    
    with open('./segments/' + file + '/' + file + '.json', "w") as write_file:
        json.dump(jsoutput, write_file)

    # alpha channel for red boundaries layer
    alpha_channel_boundaries = np.zeros(dim)

    # layer for red boundaries
    img_red = np.zeros(dim)
    img_red1 = np.zeros(dim)
    img_red2 = np.zeros(dim)
    
    # writing SQL load script
    INIT_CONTENT_SQL += "CALL AddImage('Image', '{}', '1', '{}', @TalkId);\n".format(file, ', '.join(images_dict[file]))

    # setting pixels to opact regarding their segment
    for s in range(numberOfSegments+1):

        # create alpha layer, init to 0
        alpha_channel = np.zeros(dim)

        for h in range(dim[0]):
            for w in range(dim[1]):
                if (segments[h, w] == s):
                    # count = count + 1 
                    alpha_channel[h, w] = 255
                if ((h-1 >= 0 and h+1 < dim[0] and w-1 >= 0 and w+1 < dim[1]) and (h== 0 or w == 0 or h == dim[0] or w == dim[1] or segments[h, w] != segments[h-1, w] or segments[h, w] != segments[h+1, w] or segments[h, w] != segments[h, w-1] or segments[h, w] != segments[h, w+1])):
                    img_red[h, w] = 255
                    img_red1[h, w] = 0
                    img_red2[h, w] = 0
                    alpha_channel_boundaries[h, w] = 255

        
        # joining rgb and alpha layer and writing result to file
        if (len(img.shape) > 2):
            result = np.dstack((img, alpha_channel)) 
        else:
            result = np.dstack((img, img1, img2, alpha_channel))
        result = result.astype(np.uint8)
        result = Image.fromarray(result, 'RGBA')
        result.save('./segments/' + file + '/' + file + '_segment_' + str(s) + '.png')

        result_boundaries = np.dstack((img_red, img_red1, img_red2, alpha_channel_boundaries))
        result_boundaries = result_boundaries.astype(np.uint8)
        result_boundaries = Image.fromarray(result_boundaries, 'RGBA')
        result_boundaries.save('./segments/' + file + '/' + file + '_segment_boundaries.png')


  
    print('./segments/' + file + ' done')

# writing sql load script to file
f = open("./init_content.sql", "w")
f.write(INIT_CONTENT_SQL)
f.close()
    